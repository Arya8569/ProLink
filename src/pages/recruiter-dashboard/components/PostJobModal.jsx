import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const PostJobModal = ({ isOpen, onClose, onJobPosted, user }) => {
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        salary_range: '',
        job_type: 'Full-time',
        description: '',
        requirements: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { title, department, location, salary_range, job_type, description, requirements } = formData;

            // Convert requirements string to array
            const requirementsArray = requirements.split('\n').filter(req => req.trim() !== '');

            if (!user || !user.id) throw new Error('User authentication missing');

            const { data, error } = await supabase
                .from('jobs')
                .insert({
                    recruiter_id: user.id,
                    title,
                    department,
                    location,
                    salary_range,
                    job_type,
                    description,
                    requirements: requirementsArray,
                    status: 'active',
                    posted_date: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;

            onJobPosted(data);
            onClose();
            // Reset form
            setFormData({
                title: '',
                department: '',
                location: '',
                salary_range: '',
                job_type: 'Full-time',
                description: '',
                requirements: ''
            });

        } catch (err) {
            console.error('Error posting job:', err);
            setError(err.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    const jobTypeOptions = [
        { value: 'Full-time', label: 'Full-time' },
        { value: 'Part-time', label: 'Part-time' },
        { value: 'Contract', label: 'Contract' },
        { value: 'Internship', label: 'Internship' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Post a New Job</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <Icon name="X" size={20} />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Job Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Senior React Developer"
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                placeholder="e.g. Engineering"
                                required
                            />
                            <Input
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Remote / New York"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Salary Range"
                                name="salary_range"
                                value={formData.salary_range}
                                onChange={handleChange}
                                placeholder="e.g. $100k - $120k"
                            />
                            <Select
                                label="Job Type"
                                options={jobTypeOptions}
                                value={formData.job_type}
                                onChange={(val) => setFormData(prev => ({ ...prev, job_type: val }))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Job responsibilities and details..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Requirements (one per line)</label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="- 5+ years React experience&#10;- TypeScript knowledge"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading}>
                                Post Job
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostJobModal;
