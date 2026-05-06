import PageTransition from '@/components/animations/PageTransition';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Card } from '@/components/ui/CustomCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MedicalRecord, useRecords } from '@/contexts/RecordsContext';
import { useToast } from '@/hooks/use-toast';
import { SERVER_URL } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Calendar,
  Download,
  Eye,
  FilePlus2,
  FileText,
  FileUp,
  Filter,
  Search,
  Share2,
  SlidersHorizontal,
  TestTube,
  Trash2,
  UserRound
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const RecordCard = ({ record, onDelete }: { record: MedicalRecord; onDelete: (id: number) => void }) => {
  const { toast } = useToast();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleDownload = () => {
    if (record.file_name) {
      const url = `${SERVER_URL}/download/${record.file_name}`;
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', record.file_name || 'file'); // Ensure the download attribute is set
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

  const handleView = () => {
    if (record.file_name) {
      const url = `${SERVER_URL}/view/${record.file_name}`;
      console.log('View URL:', url);
      window.open(url, '_blank');
    } else {
      toast({
        title: "View Failed",
        description: "No file data available to view.",
        variant: "destructive"
      });
    }
  };

  // const handleShare = () => {
  //   if (record.owner === 'pathlab') {
  //     toast({
  //       title: "Report Shared",
  //       description: `Report has been shared with patient ID: ${record.patient_id}`,
  //     });
  //   } else {
  //     toast({
  //       title: "Record Shared",
  //       description: "Record has been shared with your healthcare provider.",
  //     });
  //   }
  // };

  const shareUrl = `${SERVER_URL}/view/${record.file_name}`;
  const shareText = `Check out this medical record: ${record.title}`;

  const handleShareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      '_blank'
    );
    setShowShareMenu(false);
  };

  const handleShareEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent('Medical Record')}&body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      '_blank'
    );
    setShowShareMenu(false);
  };

  const handleShareSMS = () => {
    window.open(
      `sms:?body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      '_blank'
    );
    setShowShareMenu(false);
  };

  // Optional: Use Web Share API if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: record.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        toast({
          title: "Share Cancelled",
          description: "The share action was cancelled.",
        });
      }
    } else {
      toast({
        title: "Share Not Supported",
        description: "Your browser does not support native sharing.",
        variant: "destructive"
      });
    }
    setShowShareMenu(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      onDelete(record.id);
      toast({
        title: "Record Deleted",
        description: "The record has been deleted successfully.",
      });
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{record.title}</h3>
            <div className="mt-1 text-sm text-gray-500">
              {record.doctor ? record.doctor : 'No doctor specified'}
              {record.provider && ` • ${record.provider}`}
            </div>
          </div>
          {record.type && (
            <span className="px-2 py-1 text-xs font-medium bg-medical-lightBlue text-medical-blue rounded-full">
              {record.type}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Calendar size={14} className="mr-1.5" />
          <span>{new Date(record.date).toLocaleDateString()}</span>

          {record.owner === 'pathlab' && record.patient_id && (
            <>
              <span className="mx-1.5">•</span>
              <UserRound size={14} className="mr-1.5" />
              <span>Patient: {record.patient_id}</span>
            </>
          )}
        </div>

        {record.file_name && (
          <div className="mt-2 text-xs text-gray-500">
            File: {record.file_name} ({(record.file_size || 0) / (1024 * 1024) < 0.01 ?
              "< 0.01 MB" : ((record.file_size || 0) / (1024 * 1024)).toFixed(2) + " MB"}
            )
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-medical-blue"
                    onClick={handleView}
                  >
                    <Eye size={16} className="mr-1.5" /> View
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View document</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-medical-blue"
                    onClick={handleDownload}
                  >
                    <Download size={16} className="mr-1.5" /> Download
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download document</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-red-600"
                    onClick={handleDelete}
                  >
                    <Trash2 size={16} className="mr-1.5" /> Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete this record</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-medical-blue"
                    onClick={e => {
                      e.stopPropagation();
                      setShowShareMenu((v) => !v);
                    }}
                  >
                    <Share2 size={16} className="mr-1.5" /> Share
                  </Button>
                  {showShareMenu && (
                    <div
                      className="absolute right-0 z-50 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-medical-lightBlue hover:text-medical-blue transition rounded-t-lg"
                        onClick={handleShareWhatsApp}
                      >
                        <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12a11.93 11.93 0 0 0 1.64 6L0 24l6.26-1.64A12.07 12.07 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22a9.93 9.93 0 0 1-5.3-1.5l-.38-.23-3.72.98.99-3.62-.25-.37A9.93 9.93 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.41-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.34-.26.27-1 1-.99 2.43.01 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.62.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z"/></svg>
                        Share via WhatsApp
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-medical-lightBlue hover:text-medical-blue transition"
                        onClick={handleShareEmail}
                      >
                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zm0 12H4V8.99l8 6.99 8-6.99V18z"/></svg>
                        Share via Email
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-medical-lightBlue hover:text-medical-blue transition"
                        onClick={handleShareSMS}
                      >
                        <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4v16l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H6l-2 2V4h16v10z"/></svg>
                        Share via SMS
                      </button>
                      <button
                        className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-medical-lightBlue hover:text-medical-blue transition rounded-b-lg"
                        onClick={handleNativeShare}
                      >
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                        Link Share
                      </button>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>Share this record</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </motion.div>
  );
};

const Records = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recordType, setRecordType] = useState('all');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const { getCurrentUserRecords, deleteRecord } = useRecords();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    const fetchRecords = async () => {
      try {
        const userRecords = await getCurrentUserRecords();
        setRecords(userRecords);
      } catch (err) {
        console.error('Error fetching records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [getCurrentUserRecords]);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}'); // Retrieve current user from localStorage

  const filteredRecords = records.filter((record) => {
    if (userRole === 'pathlab') {
      return record.lab_id === currentUser.id; // Filter by lab_id
    } else if (userRole === 'patient') {
      return record.patient_id === currentUser.patient_id; // Filter by patient_id
    }
    return false;
  });

  console.log('Filtered Records:', filteredRecords);

  const handleDeleteRecord = async (id: number) => {
    try {
      await deleteRecord(id);
      setRecords(prevRecords => prevRecords.filter(r => r.id !== id));
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the record. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="page-container min-h-screen pt-24 pb-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {userRole === 'pathlab' ? (
                  <span className="flex items-center">
                    <TestTube size={28} className="mr-2 text-medical-blue" />
                    Laboratory Records
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FileText size={28} className="mr-2 text-medical-blue" />
                    Medical Records
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-2">
                {userRole === 'pathlab'
                  ? 'Manage and share laboratory test reports with patients'
                  : 'Access and manage all your health records in one place'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="bg-medical-blue hover:bg-blue-700">
                <Link to="/records/upload">
                  <FileUp size={18} className="mr-2" />
                  Upload
                </Link>
              </Button>
              <Button variant="outline" className="border-medical-blue text-medical-blue">
                <FilePlus2 size={18} className="mr-2" />
                Add Manually
              </Button>
            </div>
          </div>

          <Card className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 p-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder={userRole === 'pathlab' ? "Search lab reports..." : "Search records..."}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Select value={recordType} onValueChange={setRecordType}>
                  <SelectTrigger className="w-[180px]">
                    <Filter size={16} className="mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                    <SelectItem value="Examination">Examination</SelectItem>
                    <SelectItem value="Imaging">Imaging</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Dental">Dental</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal size={18} />
                </Button>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="bg-gray-50 border w-full p-1 rounded-lg">
              <TabsTrigger className="flex-1" value="all">All Records</TabsTrigger>
              <TabsTrigger className="flex-1" value="recent">Recent</TabsTrigger>
              {userRole === 'pathlab' ? (
                <TabsTrigger className="flex-1" value="shared">Shared with Patients</TabsTrigger>
              ) : (
                <TabsTrigger className="flex-1" value="shared">Shared with Me</TabsTrigger>
              )}
              <TabsTrigger className="flex-1" value="favorites">Favorites</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
            {filteredRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map((record) => (
                  <RecordCard key={record.id} record={record} onDelete={handleDeleteRecord} />
                ))}
              </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No records found</h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {records.slice(0, 3).map((record) => (
                  <RecordCard key={record.id} record={record} onDelete={handleDeleteRecord} />
                ))}
              </div>
            </TabsContent>

            {userRole === 'pathlab' ? (
              <TabsContent value="shared" className="mt-6">
                {records.filter(r => r.patient_id).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {records.filter(r => r.patient_id).map((record) => (
                      <RecordCard key={record.id} record={record} onDelete={handleDeleteRecord} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No shared reports</h3>
                    <p className="text-sm text-gray-500">
                      You haven't shared any reports with patients yet
                    </p>
                  </div>
                )}
              </TabsContent>
            ) : (
              <TabsContent value="shared" className="mt-6">
                {records.filter(r => r.owner === 'pathlab').length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {records.filter(r => r.owner === 'pathlab').map((record) => (
                      <RecordCard key={record.id} record={record} onDelete={handleDeleteRecord} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No shared records</h3>
                    <p className="text-sm text-gray-500">
                      No records have been shared with you yet
                    </p>
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="favorites" className="mt-6">
              <div className="text-center py-16">
                <div className="text-center py-16">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No favorite records</h3>
                  <p className="text-sm text-gray-500">
                    Mark important records as favorites for quick access
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <Footer />
      </PageTransition>
    </>
  );
};

export default Records;