import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../supabaseClient';
import { extractDataFromPDF } from '../../utils/pdf-util';
import { parseResumeToProfile } from '../../utils/groq';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_AVATAR = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isParsing, setIsParsing] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        avatar: '',
        skills: [],
        experience: [],
        education: [],
        projects: []
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const storedUser = localStorage.getItem('prolink-user');
            if (!storedUser) {
                navigate('/login');
                return;
            }
            const currentUser = JSON.parse(storedUser);
            setUser(currentUser);

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                if (data) {
                    setProfileData({
                        name: data.name || '',
                        email: data.email || '',
                        bio: data.bio || '',
                        avatar: data.avatar_url || '',
                        skills: data.skills || [],
                        experience: data.experience || [],
                        education: data.education || [],
                        projects: data.projects || []
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsParsing(true);
        try {
            const { text, photo } = await extractDataFromPDF(file);
            const parsedData = await parseResumeToProfile(text);
            
            setProfileData(prev => ({
                ...prev,
                avatar: photo || prev.avatar,
                skills: parsedData.skills || prev.skills,
                experience: parsedData.experience || prev.experience,
                education: parsedData.education || prev.education,
                projects: parsedData.projects || prev.projects
            }));
            
            // Switch to skills tab to show results
            setActiveTab('skills');
            alert('Resume parsed successfully! Please review the categorized data.');
        } catch (error) {
            console.error('Parsing failed:', error);
            const errorMessage = error.message || 'Unknown error';
            alert(`Failed to parse resume: ${errorMessage}. You can still fill in your profile manually.`);
        } finally {
            setIsParsing(false);
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setProfileData(prev => ({ ...prev, avatar: event.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!user) return;
        
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: profileData.name,
                    bio: profileData.bio,
                    avatar_url: profileData.avatar,
                    skills: profileData.skills,
                    experience: profileData.experience,
                    education: profileData.education,
                    projects: profileData.projects
                })
                .eq('id', user.id);

            if (error) {
                // If specific columns don't exist, this might fail.
                // In a real scenario, we'd use metadata or JSONB.
                throw error;
            }
            
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save profile. Note: Some fields might not persist if the database schema is not updated.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('prolink-user');
        navigate('/login');
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: 'User' },
        { id: 'skills', label: 'Skills', icon: 'Code' },
        { id: 'experience', label: 'Experience', icon: 'Briefcase' },
        { id: 'education', label: 'Education', icon: 'GraduationCap' },
        { id: 'projects', label: 'Projects', icon: 'Folders' }
    ];

    if (isLoading && !profileData.name) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header user={user} onLogout={handleLogout} />
            
            <main className="pt-20 pb-12">
                <div className="max-w-5xl mx-auto px-4 lg:px-6">
                    {/* Hero / Header Section */}
                    <div className="bg-card border border-border rounded-xl p-8 mb-8 relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                            <div className="relative group cursor-pointer" onClick={() => document.getElementById('photo-upload').click()}>
                                <input
                                    type="file"
                                    id="photo-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center text-4xl font-bold text-white border-4 border-background shadow-lg overflow-hidden relative">
                                    {(profileData.avatar && !profileData.avatar.includes('randomuser.me')) ? (
                                        <img src={profileData.avatar} alt={profileData.name} className="w-full h-full object-cover" />
                                    ) : (user?.avatar && !user.avatar.includes('randomuser.me')) ? (
                                        <img src={user.avatar} alt={profileData.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={DEFAULT_AVATAR} alt="Default" className="w-full h-full object-cover" />
                                    )}
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Icon name="Camera" size={24} className="text-white" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full border-2 border-background shadow-soft">
                                    <Icon name="Plus" size={14} />
                                </div>
                            </div>
                            
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-foreground mb-1">{profileData.name}</h1>
                                <p className="text-muted-foreground mb-4">{profileData.email}</p>
                                
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="resume-parse"
                                            className="hidden"
                                            accept=".pdf"
                                            onChange={handleResumeUpload}
                                            disabled={isParsing}
                                        />
                                        <label
                                            htmlFor="resume-parse"
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                                                isParsing 
                                                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft'
                                            }`}
                                        >
                                            <Icon name={isParsing ? "Loader2" : "Upload"} size={16} className={isParsing ? "animate-spin" : ""} />
                                            <span>{isParsing ? 'Parsing Resume...' : 'Upload Resume to Auto-Fill'}</span>
                                        </label>
                                    </div>
                                    <Button variant="outline" onClick={handleSave} disabled={isLoading}>
                                        <Icon name="Save" size={16} className="mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Tabs Sidebar */}
                        <div className="lg:col-span-1 space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-primary/10 text-primary border-l-4 border-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <Icon name={tab.icon} size={18} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-card border border-border rounded-xl p-6 min-h-[400px]"
                                >
                                    {activeTab === 'basic' && (
                                        <div className="space-y-6">
                                            <h2 className="text-xl font-bold text-foreground mb-4">Basic Information</h2>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.name}
                                                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-muted-foreground mb-1">Short Bio</label>
                                                    <textarea
                                                        rows={4}
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                                        placeholder="Write a brief introduction about yourself..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'skills' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold text-foreground">Skills</h2>
                                                <Button size="sm" variant="ghost" onClick={() => {
                                                    const skill = prompt('Enter a skill:');
                                                    if (skill) setProfileData({...profileData, skills: [...profileData.skills, skill]});
                                                }}>
                                                    <Icon name="Plus" size={16} />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {profileData.skills.length > 0 ? (
                                                    profileData.skills.map((skill, i) => (
                                                        <span key={i} className="flex items-center space-x-2 px-3 py-1.5 bg-primary/5 text-primary border border-primary/20 rounded-full text-sm font-medium">
                                                            <span>{skill}</span>
                                                            <button onClick={() => setProfileData({
                                                                ...profileData, 
                                                                skills: profileData.skills.filter((_, idx) => idx !== i)
                                                            })} className="hover:text-error transition-colors">
                                                                <Icon name="X" size={14} />
                                                            </button>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-muted-foreground italic text-sm">No skills added yet. Upload a resume to automatically extract them.</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'experience' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold text-foreground">Professional Experience</h2>
                                                <Button size="sm" variant="ghost" onClick={() => {
                                                    setProfileData({
                                                        ...profileData, 
                                                        experience: [{ role: '', company: '', duration: '', description: '' }, ...profileData.experience]
                                                    });
                                                }}>
                                                    <Icon name="Plus" size={16} />
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                {profileData.experience.map((exp, i) => (
                                                    <div key={i} className="p-4 bg-muted/30 border border-border rounded-lg relative group">
                                                        <button 
                                                            className="absolute top-4 right-4 text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                                                            onClick={() => setProfileData({
                                                                ...profileData,
                                                                experience: profileData.experience.filter((_, idx) => idx !== i)
                                                            })}
                                                        >
                                                            <Icon name="Trash2" size={16} />
                                                        </button>
                                                        <div className="grid grid-cols-2 gap-4 mb-2">
                                                            <input
                                                                placeholder="Role"
                                                                value={exp.role}
                                                                onChange={(e) => {
                                                                    const newExp = [...profileData.experience];
                                                                    newExp[i].role = e.target.value;
                                                                    setProfileData({...profileData, experience: newExp});
                                                                }}
                                                                className="bg-transparent font-bold text-foreground outline-none border-b border-transparent focus:border-primary px-1"
                                                            />
                                                            <input
                                                                placeholder="Duration"
                                                                value={exp.duration}
                                                                onChange={(e) => {
                                                                    const newExp = [...profileData.experience];
                                                                    newExp[i].duration = e.target.value;
                                                                    setProfileData({...profileData, experience: newExp});
                                                                }}
                                                                className="bg-transparent text-sm text-muted-foreground outline-none border-b border-transparent focus:border-primary text-right px-1"
                                                            />
                                                        </div>
                                                        <input
                                                            placeholder="Company"
                                                            value={exp.company}
                                                            onChange={(e) => {
                                                                const newExp = [...profileData.experience];
                                                                newExp[i].company = e.target.value;
                                                                setProfileData({...profileData, experience: newExp});
                                                            }}
                                                            className="w-full bg-transparent text-sm text-primary font-medium outline-none border-b border-transparent focus:border-primary mb-2 px-1"
                                                        />
                                                        <textarea
                                                            placeholder="Description"
                                                            value={exp.description}
                                                            onChange={(e) => {
                                                                const newExp = [...profileData.experience];
                                                                newExp[i].description = e.target.value;
                                                                setProfileData({...profileData, experience: newExp});
                                                            }}
                                                            className="w-full bg-transparent text-sm text-muted-foreground outline-none border-b border-transparent focus:border-primary resize-none px-1"
                                                            rows={2}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'education' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold text-foreground">Education</h2>
                                                <Button size="sm" variant="ghost" onClick={() => {
                                                    setProfileData({
                                                        ...profileData, 
                                                        education: [{ degree: '', institution: '', year: '' }, ...profileData.education]
                                                    });
                                                }}>
                                                    <Icon name="Plus" size={16} />
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                {profileData.education.map((edu, i) => (
                                                    <div key={i} className="p-4 bg-muted/30 border border-border rounded-lg relative group">
                                                        <button 
                                                            className="absolute top-4 right-4 text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                                                            onClick={() => setProfileData({
                                                                ...profileData,
                                                                education: profileData.education.filter((_, idx) => idx !== i)
                                                            })}
                                                        >
                                                            <Icon name="Trash2" size={16} />
                                                        </button>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="col-span-2">
                                                                <input
                                                                    placeholder="Degree"
                                                                    value={edu.degree}
                                                                    onChange={(e) => {
                                                                        const newEdu = [...profileData.education];
                                                                        newEdu[i].degree = e.target.value;
                                                                        setProfileData({...profileData, education: newEdu});
                                                                    }}
                                                                    className="w-full bg-transparent font-bold text-foreground outline-none border-b border-transparent focus:border-primary px-1 mb-1"
                                                                />
                                                                <input
                                                                    placeholder="Institution"
                                                                    value={edu.institution}
                                                                    onChange={(e) => {
                                                                        const newEdu = [...profileData.education];
                                                                        newEdu[i].institution = e.target.value;
                                                                        setProfileData({...profileData, education: newEdu});
                                                                    }}
                                                                    className="w-full bg-transparent text-sm text-muted-foreground outline-none border-b border-transparent focus:border-primary px-1"
                                                                />
                                                            </div>
                                                            <input
                                                                placeholder="Year"
                                                                value={edu.year}
                                                                onChange={(e) => {
                                                                    const newEdu = [...profileData.education];
                                                                    newEdu[i].year = e.target.value;
                                                                    setProfileData({...profileData, education: newEdu});
                                                                }}
                                                                className="bg-transparent text-sm text-muted-foreground outline-none border-b border-transparent focus:border-primary text-right self-start px-1"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'projects' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold text-foreground">Projects</h2>
                                                <Button size="sm" variant="ghost" onClick={() => {
                                                    setProfileData({
                                                        ...profileData, 
                                                        projects: [{ title: '', description: '', link: '' }, ...profileData.projects]
                                                    });
                                                }}>
                                                    <Icon name="Plus" size={16} />
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                {profileData.projects.map((proj, i) => (
                                                    <div key={i} className="p-4 bg-muted/30 border border-border rounded-lg relative group">
                                                        <button 
                                                            className="absolute top-4 right-4 text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100 transition-all"
                                                            onClick={() => setProfileData({
                                                                ...profileData,
                                                                projects: profileData.projects.filter((_, idx) => idx !== i)
                                                            })}
                                                        >
                                                            <Icon name="Trash2" size={16} />
                                                        </button>
                                                        <input
                                                            placeholder="Project Title"
                                                            value={proj.title}
                                                            onChange={(e) => {
                                                                const newProj = [...profileData.projects];
                                                                newProj[i].title = e.target.value;
                                                                setProfileData({...profileData, projects: newProj});
                                                            }}
                                                            className="w-full bg-transparent font-bold text-foreground outline-none border-b border-transparent focus:border-primary px-1 mb-2"
                                                        />
                                                        <textarea
                                                            placeholder="Project Description"
                                                            value={proj.description}
                                                            onChange={(e) => {
                                                                const newProj = [...profileData.projects];
                                                                newProj[i].description = e.target.value;
                                                                setProfileData({...profileData, projects: newProj});
                                                            }}
                                                            className="w-full bg-transparent text-sm text-muted-foreground outline-none border-b border-transparent focus:border-primary resize-none px-1 mb-2"
                                                            rows={2}
                                                        />
                                                        <div className="flex items-center text-primary text-xs font-medium">
                                                            <Icon name="Link" size={12} className="mr-1" />
                                                            <input
                                                                placeholder="Project Link (Optional)"
                                                                value={proj.link}
                                                                onChange={(e) => {
                                                                    const newProj = [...profileData.projects];
                                                                    newProj[i].link = e.target.value;
                                                                    setProfileData({...profileData, projects: newProj});
                                                                }}
                                                                className="bg-transparent w-full outline-none border-b border-transparent focus:border-primary px-1"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
