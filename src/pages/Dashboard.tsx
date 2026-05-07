import PageTransition from '@/components/animations/PageTransition';
import StatsCard from '@/components/dashboard/StatsCard';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/CustomCard';
import { MedicalRecord, useRecords } from '@/contexts/RecordsContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ArrowUpRight, BarChart as BarChartIcon, Calendar, Download, Eye, FilePlus2, FileText, UserRound } from 'lucide-react';
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
// if using types
// import { MedicalRecord } from "../types/MedicalRecord"; // adjust path if needed
import { Link } from 'react-router-dom';
import { API_URL, SERVER_URL, PREDICT_URL } from '@/lib/api';

const Dashboard = () => {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { getCurrentUserRecords } = useRecords();
  const { getPatientRecords } = useRecords();
  const [patientRecords, setPatientRecords] = useState([]);
  const [predictionsMap, setPredictionsMap] = useState<Record<string, any>>({}); 
  const [loadingPredictions, setLoadingPredictions] = useState<boolean>(false);
  const [patientPrediction, setPatientPrediction] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  const [analysisLoading, setAnalysisLoading] = useState<Record<string, boolean>>({});
  const [labChartView, setLabChartView] = useState<'daily' | 'monthly'>('daily');

  // Function to load existing predictions from database
  const loadExistingPredictions = async (records: MedicalRecord[], role: string | null) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const patientId = role === 'patient' ? currentUser.patient_id : null;

      if (!patientId) return;

      const predictionResponse = await fetch(`${API_URL}/predictions/patient/${patientId}`);
      if (predictionResponse.ok) {
        const predictions = await predictionResponse.json();
        if (Array.isArray(predictions) && predictions.length > 0) {
          const predictionsByRecord: Record<string, any> = {};
          predictions.forEach((prediction: any) => {
            if (prediction.record_id) {
              predictionsByRecord[prediction.record_id] = prediction;
            }
          });

          const newAnalysisResults: Record<string, any> = {};
          records.forEach(record => {
            const prediction = predictionsByRecord[record.id];
            if (!prediction) return;

            newAnalysisResults[record.id] = {
              success: true,
              data: prediction.scores || {},
              health_score: {
                score: parseFloat(prediction.final_score) || 50,
                risk_level: parseFloat(prediction.final_score) >= 70 ? 'low' :
                           parseFloat(prediction.final_score) >= 50 ? 'moderate' :
                           parseFloat(prediction.final_score) >= 30 ? 'high' : 'critical',
                metrics: []
              },
              ocr_preview: prediction.scores ? 'Analysis loaded from cache' : 'Analysis loaded from cache'
            };
          });

          if (Object.keys(newAnalysisResults).length > 0) {
            setAnalysisResults(prev => ({ ...prev, ...newAnalysisResults }));
          }
        }
      }
    } catch (error) {
      console.error("Failed to load existing predictions:", error);
    }
  };


  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role); // Ensure userRole is set correctly
    const fetchRecords = async () => {
      try {
        const userRecords = await getCurrentUserRecords();
        setRecords(userRecords);
        
        // Load existing predictions after records are loaded
        if (userRecords.length > 0) {
          await loadExistingPredictions(userRecords, role);
        }
      } catch (err) {
        console.error('Error fetching records:', err);
        toast({
          title: "Error",
          description: "Failed to load records",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, [getCurrentUserRecords]);
  
  

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}'); // Fetch current user from localStorage

  const filteredRecords = records.filter((record) => {
    if (userRole === 'pathlab') {
      return record.lab_id === currentUser.id; // Filter by lab_id
    } else if (userRole === 'patient') {
      return record.patient_id === currentUser.patient_id; // Filter by patient_id
    }
    return false;
  });

  console.log('Filtered Records:', filteredRecords);

  const recentRecords = filteredRecords.slice(0, 3);

  // File handling functions
  const handleViewFile = (record: MedicalRecord) => {
    if (record.file_name) {
      const url = `${SERVER_URL}/uploads/${record.file_name}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: "View Failed",
        description: "No file data available to view.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadFile = (record: MedicalRecord) => {
    if (record.file_name) {
      const url = `${SERVER_URL}/uploads/${record.file_name}`;
      const a = document.createElement('a');
      a.href = url;
      a.download = record.file_name || 'file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({
        title: "File Downloaded",
        description: "Your file has been downloaded successfully.",
      });
    } else {
      toast({
        title: "Download Failed",
        description: "No file data available for download.",
        variant: "destructive"
      });
    }
  };

// Place this function inside the Dashboard component, after your existing file handlers
const analyzeReportForHealth = async (record: MedicalRecord) => {
  try {
    if (!record || !record.file_name) return null;
    // if we've already fetched for this file, return cached result
    if (analysisResults[record.id]) return analysisResults[record.id];

    // First, check if predictions exist in database
    try {
      const predictionResponse = await fetch(`${API_URL}/predictions/record/${record.id}`);
      if (predictionResponse.ok) {
        const predictionData = await predictionResponse.json();
        if (predictionData && predictionData.length > 0) {
          // Convert database prediction format to analysis format
          const latestPrediction = predictionData[0];
          const analysisData = {
            success: true,
            data: latestPrediction.extracted_fields || {},
            health_score: {
              score: latestPrediction.prediction === 1 ? Math.random() * 40 + 60 : Math.random() * 60 + 20, // Mock score based on prediction
              risk_level: latestPrediction.prediction === 1 ? 'high' : 'low',
              metrics: [] // Could be populated from extracted_fields if available
            },
            ocr_preview: latestPrediction.ocr_preview || "Analysis loaded from cache"
          };
          setAnalysisResults(prev => ({ ...prev, [record.id]: analysisData }));
          return analysisData;
        }
      }
    } catch (dbError) {
      console.log("No cached predictions found, running analysis:", dbError);
    }

    // If no cached predictions, run the analysis
    const apiUrl = `${PREDICT_URL}/analyze`;
    const payload = { file_url: `${SERVER_URL}/uploads/${record.file_name}` };

    // Optional: set loading state for UI indicator
    setAnalysisLoading(prev => ({ ...prev, [record.id]: true }));

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setAnalysisLoading(prev => ({ ...prev, [record.id]: false }));

    if (!res.ok) {
      const text = await res.text();
      console.error("Analysis API error:", text);
      return null;
    }

    const data = await res.json();

    // Save the analysis results to database
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const patientId = userRole === 'patient' ? currentUser.patient_id : null;

      if (patientId) {
        const predictionPayload = {
          patient_id: patientId,
          record_id: record.id,
          lab_id: record.lab_id,
          final_score: data.health_score?.score || 50,
          scores: data.data || {}
        };

        await fetch(`${API_URL}/predictions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(predictionPayload)
        });
      }
    } catch (saveError) {
      console.error("Failed to save prediction to database:", saveError);
      // Continue anyway - analysis still worked
    }

    // store by record id
    setAnalysisResults(prev => ({ ...prev, [record.id]: data }));
    return data;
  } catch (err) {
    console.error("analyzeReportForHealth error:", err);
    setAnalysisLoading(prev => ({ ...prev, [record.id]: false }));
    return null;
  }
};

  // ---------- AUTO-RUN ANALYSIS USEEFFECT ----------
  useEffect(() => {
    if (!filteredRecords || filteredRecords.length === 0) return;

    let cancelled = false;

    (async () => {
      // Only analyze records that don't have cached predictions
      const toAnalyze = filteredRecords
        .filter(rec => rec.file_name && !analysisResults[rec.id])
        .slice(0, 3); // Limit to 3 at a time to avoid overwhelming

      if (toAnalyze.length === 0) return; // All records already have cached predictions

      for (const rec of toAnalyze) {
        if (cancelled) break;
        // await each call to avoid overwhelming the service
        // eslint-disable-next-line no-await-in-loop
        // @ts-ignore
        await analyzeReportForHealth(rec);
      }
    })();

    return () => {
      cancelled = true;
    };
    // We intentionally avoid adding analysisResults to deps to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRecords, analysisResults]);

  // Load patient-level prediction data for consistent chart
  useEffect(() => {
    if (userRole === 'patient') {
      const loadPatientData = async () => {
        try {
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const patientId = currentUser.patient_id;

          if (patientId) {
            const response = await fetch(`${API_URL}/predictions/patient/${patientId}`);
            if (response.ok) {
              const data = await response.json();
              // Store all predictions as an array for proper chart rendering
              setPatientPrediction(Array.isArray(data) && data.length > 0 ? data : null);
            }
          }
        } catch (error) {
          console.error("Failed to load patient prediction:", error);
        }
      };

      loadPatientData();
    }
  }, [userRole]);

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="page-container min-h-screen pt-24 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
            {userRole === 'pathlab' ? 'Laboratory Dashboard' : 'Patient Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2">
              {userRole === 'pathlab' 
                ? 'Manage and upload patient reports' 
                : 'Welcome back! Here\'s an overview of your health records.'}
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Records"
              value={filteredRecords.length.toString()}
              icon={<FileText size={24} className="text-medical-blue" />}
              description="All uploaded records"
            />
            
            {userRole === 'pathlab' ? null: (
              <StatsCard
                title="Last Checkup"
                value={filteredRecords.length > 0 ? new Date(filteredRecords[0].date).toLocaleDateString() : "None"}
                icon={<Calendar size={24} className="text-medical-blue" />}
                description={filteredRecords.length > 0 ? filteredRecords[0].title : "No records yet"}
              />
            )}
            
            {userRole === 'pathlab' ? (
              <StatsCard
                title="Reports Shared"
                value={Math.floor(filteredRecords.filter(r => r.patient_id).length).toString()}
                icon={<FileText size={24} className="text-medical-blue" />}
                description="With patients"
              />
            ) : null}
            
          </div>

          <div className={`grid grid-cols-1 ${userRole === 'pathlab' ? 'lg:grid-cols-3' : ''} gap-8`}>
            {/* Recent Medical Records */}
            <div className={userRole === 'pathlab' ? 'lg:col-span-2' : ''}>
              <Card className="h-full p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {userRole === 'pathlab' ? 'Recent Lab Reports' : 'Recent Medical Records'}
                  </h2>
                  <Button asChild variant="ghost" size="sm" className="text-medical-blue">
                    <Link to="/records">
                      View All <ArrowUpRight size={16} className="ml-1" />
                    </Link>
                  </Button>
                </div>
                
                {recentRecords.length > 0 ? (
                  <div className="space-y-4">
                    {recentRecords.map((record) => (
                      <motion.div
                        key={record.id}
                        whileHover={{ x: 3 }}
                        className="p-4 border border-gray-100 rounded-lg hover:bg-blue-50/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{record.title}</h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <span>{record.doctor || 'No doctor specified'}</span>
                              {record.provider && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{record.provider}</span>
                                </>
                              )}
                              <span className="mx-2">•</span>
                              <span>{new Date(record.date).toLocaleDateString()}</span>
                              
                              {record.owner === 'pathlab' && record.patient_id && (
                                <>
                                  <span className="mx-2">•</span>
                                  <UserRound size={14} className="mr-1" />
                                  <span>Patient: {record.patient_id}</span>
                                </>
                              )}
                            </div>
                            
                            {record.file_name && (
                              <div className="mt-2 text-xs text-gray-500">
                                File: {record.file_name}
                              </div>
                            )}
                          </div>
                          
                          {record.type && (
                            <span className="px-2 py-1 text-xs font-medium bg-medical-lightBlue text-medical-blue rounded-full">
                              {record.type}
                            </span>
                          )}
                        </div>
                        
                        {record.fileData && (
                          <div className="mt-3 flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-600 hover:text-medical-blue"
                              onClick={() => handleViewFile(record)}
                            >
                              <Eye size={14} className="mr-1" /> View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-600 hover:text-medical-blue"
                              onClick={() => handleDownloadFile(record)}
                            >
                              <Download size={14} className="mr-1" /> Download
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No records yet</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {userRole === 'pathlab' 
                        ? 'Upload your first lab report to get started'
                        : 'Upload your first medical record to get started'}
                    </p>
                  </div>
                )}
                
                <div className="mt-6">
                  <Button asChild className="w-full bg-medical-blue hover:bg-blue-700">
                    <Link to="/records/upload">
                      <FilePlus2 size={18} className="mr-2" />
                      {userRole === 'pathlab' ? 'Upload Lab Report' : 'Upload Medical Record'}
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
            
            {userRole === 'pathlab' && (
              <div>
                <Card className="h-full p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Patient Activity</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ x: 3 }}
                      className="p-4 border border-gray-100 rounded-lg hover:bg-blue-50/50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900">Reports linked to Patient ID</h3>
                      <div className="mt-3">
                        {filteredRecords.filter(r => r.patient_id).length > 0 ? (
                          <div className="space-y-2">
                            {Array.from(new Set(filteredRecords.filter(r => r.patient_id).map(r => r.patient_id))).map((patientId, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <UserRound size={16} className="mr-2 text-medical-blue" />
                                  <span>Patient ID: {patientId}</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                {filteredRecords.filter(r => r.patient_id === patientId).length} reports
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No patients linked yet</p>
                        )}
                      </div>
                    </motion.div>
                    
                  </div>
                </Card>
              </div>
            )}
          </div>
          
          {/* Health Insights / Admin Panel based on role */}
          <div className="mt-8">
            <Card className="h-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {userRole === 'pathlab' ? 'Lab Analytics' : 'Health Insights'}
                </h2>
                {userRole === 'pathlab' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-medical-blue border-medical-blue"
                    onClick={() => setLabChartView(prev => prev === 'daily' ? 'monthly' : 'daily')}
                  >
                    <BarChartIcon size={16} className="mr-1.5" /> View {labChartView === 'daily' ? 'Monthly' : 'Daily'}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="text-medical-blue border-medical-blue">
                    <BarChartIcon size={16} className="mr-1.5" /> View Trends
                  </Button>
                )}
              </div>
              
              {userRole === 'patient' ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">Health Scores vs Reports</h3>
                    <p className="text-sm text-gray-600">Track your health scores across all medical reports</p>
                  </div>

                  {filteredRecords.length === 0 || !patientPrediction ? (
                    <div className="text-center py-8">
                      <BarChartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Health Data Available</h3>
                      <p className="text-sm text-gray-500">Upload medical reports to see your health score trends</p>
                    </div>
                  ) : (
                    (() => {
                      // Create chart data from all records and their predictions
                      const allPredictions = Array.isArray(patientPrediction) ? patientPrediction : [patientPrediction];
                      const predictionsByRecord = allPredictions.reduce((acc: Record<string, any>, prediction: any) => {
                        if (prediction.record_id) {
                          acc[prediction.record_id] = prediction;
                        }
                        return acc;
                      }, {});

                      const chartData = filteredRecords
                        .map(record => {
                          const prediction = predictionsByRecord[record.id];
                          if (!prediction) return null;

                          return {
                            date: new Date(record.date).toLocaleDateString(),
                            score: parseFloat(prediction.final_score) || 50,
                            risk: parseFloat(prediction.final_score) >= 70 ? 'low' :
                                 parseFloat(prediction.final_score) >= 50 ? 'moderate' :
                                 parseFloat(prediction.final_score) >= 30 ? 'high' : 'critical',
                            title: record.title,
                            fileName: record.file_name,
                            fullDate: record.date
                          };
                        })
                        .filter(item => item !== null)
                        .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

                      if (chartData.length === 0) {
                        return (
                          <div className="text-center py-8">
                            <BarChartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No Analysis Data Available</h3>
                            <p className="text-sm text-gray-500">Your reports are being analyzed</p>
                          </div>
                        );
                      }

                      return (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Health Score', angle: -90, position: 'insideLeft' }}
                              />
                              <Tooltip
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                        <p className="font-medium">{data.title}</p>
                                        <p className="text-xs text-gray-600 mb-1">{data.fileName}</p>
                                        <p className="text-sm text-gray-600">{label}</p>
                                        <p className="text-sm">
                                          <span className="font-medium">Score: </span>
                                          <span className={`font-bold ${
                                            data.risk === 'low' ? 'text-green-600' :
                                            data.risk === 'moderate' ? 'text-yellow-600' :
                                            data.risk === 'high' ? 'text-orange-600' :
                                            data.risk === 'critical' ? 'text-red-600' :
                                            'text-gray-600'
                                          }`}>
                                            {data.score}/100
                                          </span>
                                        </p>
                                        <p className="text-sm capitalize">
                                          <span className="font-medium">Risk: </span>
                                          <span className={`${
                                            data.risk === 'low' ? 'text-green-600' :
                                            data.risk === 'moderate' ? 'text-yellow-600' :
                                            data.risk === 'high' ? 'text-orange-600' :
                                            data.risk === 'critical' ? 'text-red-600' :
                                            'text-gray-600'
                                          }`}>
                                            {data.risk}
                                          </span>
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={{ fill: '#2563eb', strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      );
                    })()
                  )}
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">Reports Shared Over Time</h3>
                    <p className="text-sm text-gray-600">Track the number of reports shared with patients</p>
                  </div>
                  
                  {(() => {
                    const sharedRecords = filteredRecords.filter(r => r.patient_id);
                    if (sharedRecords.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <BarChartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No Data Available</h3>
                          <p className="text-sm text-gray-500">Share reports with patients to see analytics</p>
                        </div>
                      );
                    }
                    
                    const sortedRecords = [...sharedRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const dataMap: Record<string, number> = {};
                    
                    sortedRecords.forEach(record => {
                      const dateObj = new Date(record.date);
                      let key = '';
                      if (labChartView === 'daily') {
                        key = dateObj.toLocaleDateString();
                      } else {
                        key = dateObj.toLocaleDateString('default', { month: 'short', year: 'numeric' });
                      }
                      
                      if (!dataMap[key]) {
                        dataMap[key] = 0;
                      }
                      dataMap[key] += 1;
                    });
                    
                    const chartData = Object.keys(dataMap).map(key => ({
                      date: key,
                      count: dataMap[key]
                    }));

                    return (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{ fontSize: 12 }}
                              label={{ value: 'Reports Shared', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                      <p className="text-sm text-gray-600 mb-1">{label}</p>
                                      <p className="text-sm">
                                        <span className="font-medium">Reports Shared: </span>
                                        <span className="font-bold text-medical-blue">
                                          {payload[0].value}
                                        </span>
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="#2563eb" 
                              radius={[4, 4, 0, 0]}
                              maxBarSize={50}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })()}
                </div>
              )}
            </Card>
          </div>
        </div>
        <Footer />
      </PageTransition>
    </>
  );
};

export default Dashboard;
