import PageTransition from '@/components/animations/PageTransition';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/CustomCard';
import { AnimatedCard } from '@/components/ui/CustomCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserData } from '@/hooks/useUserData';
import {
  BadgeCheck,
  Bell,
  ClipboardList,
  FileText,
  Key,
  Lock,
  Save,
  Share2,
  Shield,
  User,
  UserCog
} from 'lucide-react';
import { Lab, Patient } from '../types/user'; // Adjusted the path to match the relative location
import { toast } from 'sonner';

const ProfileSetting = ({ icon, title, description, children }) => (
  <div className="flex gap-4 items-start py-6">
    <div className="bg-medical-lightBlue p-2 rounded-lg text-medical-blue">
      {icon}
    </div>
    <div className="flex-grow">
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {children}
    </div>
  </div>
);

const Profile = () => {
  const { userData, loading, updateUserData } = useUserData();
  const userRole = localStorage.getItem('userRole');
  const isPatient = userRole === 'patient';

  const handleSaveChanges = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updates = Object.fromEntries(formData.entries());

    const id = isPatient ? (userData as Patient).id : (userData as Lab).id;

    try {
      await updateUserData(id, updates);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const patientData = userData as Patient;
  const labData = userData as Lab;

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="page-container min-h-screen pt-24 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your {isPatient ? 'personal' : 'laboratory'} information and account preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="mb-8">
            <TabsList className="bg-gray-50 border w-full p-1 rounded-lg">
              <TabsTrigger className="flex gap-2 items-center" value="profile">
                <User size={16} /> Profile
              </TabsTrigger>
              <TabsTrigger className="flex gap-2 items-center" value="security">
                <Lock size={16} /> Security
              </TabsTrigger>
              <TabsTrigger className="flex gap-2 items-center" value="notifications">
                <Bell size={16} /> Notifications
              </TabsTrigger>
              <TabsTrigger className="flex gap-2 items-center" value="privacy">
                <Shield size={16} /> Privacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <AnimatedCard variant="premium">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3 flex flex-col items-center text-center p-4">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-medical-blue text-white text-xl">
                        {isPatient
                          ? `${patientData.first_name?.[0]}${patientData.last_name?.[0]}`
                          : labData.lab_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">
                      {isPatient
                        ? `${patientData.first_name} ${patientData.last_name}`
                        : labData.lab_name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{userData?.email}</p>
                    <div className="flex items-center mt-2">
                      <BadgeCheck size={16} className="text-medical-blue mr-1" />
                      <span className="text-xs font-medium text-medical-blue">Verified Account</span>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="hidden md:block" />

                  <form onSubmit={handleSaveChanges} className="md:w-2/3">
                    {isPatient ? (
                      <>
                        <ProfileSetting
                          icon={<UserCog size={20} />}
                          title="Personal Information"
                          description="Update your basic personal details"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="first_name">First Name</Label>
                              <Input
                                id="first_name"
                                name="first_name"
                                defaultValue={patientData.first_name}
                              />
                            </div>
                            <div>
                              <Label htmlFor="last_name">Last Name</Label>
                              <Input
                                id="last_name"
                                name="last_name"
                                defaultValue={patientData.last_name}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={patientData.email}
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                defaultValue={patientData.phone}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dob">Date of Birth</Label>
                              <Input
                                id="dob"
                                name="dob"
                                type="date"
                                defaultValue={patientData.dob}
                              />
                            </div>
                          </div>
                        </ProfileSetting>

                        <Separator />

                        <ProfileSetting
                          icon={<ClipboardList size={20} />}
                          title="Medical Information"
                          description="Add basic medical information for emergencies"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="blood_type">Blood Type</Label>
                              <Input
                                id="blood_type"
                                name="blood_type"
                                defaultValue={patientData.blood_type}
                              />
                            </div>
                            <div>
                              <Label htmlFor="allergies">Allergies</Label>
                              <Input
                                id="allergies"
                                name="allergies"
                                defaultValue={patientData.allergies}
                              />
                            </div>
                          </div>
                        </ProfileSetting>
                      </>
                    ) : (
                      <ProfileSetting
                        icon={<UserCog size={20} />}
                        title="Laboratory Information"
                        description="Update your laboratory details"
                      >
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor="lab_name">Laboratory Name</Label>
                            <Input
                              id="lab_name"
                              name="lab_name"
                              defaultValue={labData.lab_name}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              defaultValue={labData.email}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              defaultValue={labData.phone}
                            />
                          </div>
                          <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              name="address"
                              defaultValue={labData.address}
                            />
                          </div>
                          <div>
                            <Label htmlFor="license_number">License Number</Label>
                            <Input
                              id="license_number"
                              name="license_number"
                              defaultValue={labData.license_number}
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              name="description"
                              defaultValue={labData.description}
                            />
                          </div>
                        </div>
                      </ProfileSetting>
                    )}

                    <div className="mt-6">
                      <Button type="submit" className="w-full md:w-auto bg-medical-blue hover:bg-blue-700">
                        <Save size={16} className="mr-2" /> Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </AnimatedCard>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <AnimatedCard variant="premium">
                <ProfileSetting
                  icon={<Key size={20} />}
                  title="Password"
                  description="Change your password to enhance security"
                >
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <Button className="bg-medical-blue hover:bg-blue-700">
                      Update Password
                    </Button>
                  </div>
                </ProfileSetting>

                <Separator className="my-6" />

                <ProfileSetting
                  icon={<BadgeCheck size={20} />}
                  title="Two-Factor Authentication"
                  description="Add an extra layer of security to your account"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Two-factor authentication is not enabled yet.</p>
                      <p className="text-sm text-gray-500 mt-1">
                        We strongly recommend enabling two-factor authentication to secure your account.
                      </p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                </ProfileSetting>
              </AnimatedCard>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <AnimatedCard variant="premium">
                <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Records</p>
                      <p className="text-sm text-gray-500">Get notified when new records are added</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Record Sharing</p>
                      <p className="text-sm text-gray-500">Get notified when your records are shared</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Appointment Reminders</p>
                      <p className="text-sm text-gray-500">Get reminders for upcoming appointments</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Updates</p>
                      <p className="text-sm text-gray-500">Receive marketing and promotional emails</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="bg-medical-blue hover:bg-blue-700">
                    Save Preferences
                  </Button>
                </div>
              </AnimatedCard>
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <AnimatedCard variant="premium">
                <ProfileSetting
                  icon={<FileText size={20} />}
                  title="Data Access"
                  description="Control who can access your medical records"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow Healthcare Providers</p>
                        <p className="text-sm text-gray-500">Let your doctors access your records</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow Family Members</p>
                        <p className="text-sm text-gray-500">Let family access your records</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </ProfileSetting>

                <Separator className="my-6" />

                <ProfileSetting
                  icon={<Share2 size={20} />}
                  title="Sharing Settings"
                  description="Manage how your data can be shared"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable One-Time Sharing</p>
                        <p className="text-sm text-gray-500">Allow temporary access to your records</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Allow Data Analytics</p>
                        <p className="text-sm text-gray-500">Use your data for improving our services (anonymized)</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </ProfileSetting>

                <Separator className="my-6" />

                <ProfileSetting
                  icon={<Shield size={20} />}
                  title="Data Management"
                  description="Manage or delete your account data"
                >
                  <div className="space-y-4">
                    <Button variant="outline">Download My Data</Button>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </ProfileSetting>
              </AnimatedCard>
            </TabsContent>
          </Tabs>
        </div>
        <Footer />
      </PageTransition>
    </>
  );
};

export default Profile;
