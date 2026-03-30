import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { supabase } from '../../../supabaseClient';

const RecruiterProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company_name: '',
        company_size: '',
        company_description: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                company_name: user.company_name || '',
                company_size: user.company_size || '',
                company_description: user.company_description || ''
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const companySizeOptions = [
        { value: '1-10', label: '1-10 employees' },
        { value: '11-50', label: '11-50 employees' },
        { value: '51-200', label: '51-200 employees' },
        { value: '201-500', label: '201-500 employees' },
        { value: '501-1000', label: '501-1000 employees' },
        { value: '1000+', label: '1000+ employees' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: updateError } = await supabase
                .from('profiles')
                .update({
                    company_name: formData.company_name,
                    company_size: formData.company_size,
                    company_description: formData.company_description
                })
                .eq('id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;

            onUpdate(data);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col transform animate-in scale-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                            {user.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Recruiter Profile</h2>
                            <p className="text-sm text-muted-foreground">Manage your company information</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <Icon name="X" size={20} />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                    {error && (
                        <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm flex items-center">
                            <Icon name="AlertCircle" size={16} className="mr-2" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</label>
                            <p className="text-foreground font-medium">{formData.name}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</label>
                            <p className="text-foreground font-medium">{formData.email}</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Company Information</h3>
                            {!isEditing && (
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary">
                                    <Icon name="Edit2" size={14} className="mr-2" />
                                    Edit
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {isEditing ? (
                                <>
                                    <Input
                                        label="Company Name"
                                        name="company_name"
                                        placeholder="Enter company name"
                                        value={formData.company_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <Select
                                        label="Company Size"
                                        options={companySizeOptions}
                                        value={formData.company_size}
                                        onChange={(val) => setFormData(prev => ({ ...prev, company_size: val }))}
                                        placeholder="Select company size"
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Company Description</label>
                                        <textarea
                                            name="company_description"
                                            value={formData.company_description}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                                            placeholder="Tell us about your company..."
                                            required
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Name</label>
                                            <p className="text-foreground">{formData.company_name || 'Not specified'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Size</label>
                                            <p className="text-foreground">{formData.company_size || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Description</label>
                                        <p className="text-foreground whitespace-pre-wrap">{formData.company_description || 'No description provided.'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-muted/10 border-t border-border flex justify-end space-x-3">
                    {isEditing ? (
                        <>
                            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isLoading}>Cancel</Button>
                            <Button onClick={handleSave} loading={isLoading}>Save Changes</Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecruiterProfileModal;
