import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ScheduleInterviewModal = ({ isOpen, onClose, onInterviewScheduled, user, jobs, candidates, initialData = null }) => {
    const [formData, setFormData] = useState({
        candidate_id: '',
        job_id: '',
        date: '',
        time: '',
        type: 'video',
        meeting_link: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle initialData for rescheduling
    useEffect(() => {
        if (initialData) {
            const dt = new Date(initialData.date_time || initialData.dateTime);
            setFormData({
                candidate_id: initialData.candidate_id || (initialData.candidate?.id),
                job_id: initialData.job_id,
                date: dt.toISOString().split('T')[0],
                time: dt.toTimeString().split(' ')[0].substring(0, 5),
                type: initialData.type || 'video',
                meeting_link: initialData.meeting_link || initialData.meetingLink || '',
                notes: initialData.notes || ''
            });
        } else {
            setFormData({
                candidate_id: '',
                job_id: '',
                date: '',
                time: '',
                type: 'video',
                meeting_link: '',
                notes: ''
            });
        }
    }, [initialData, isOpen]);

    // Auto-select job if candidate is selected (only in create mode)
    useEffect(() => {
        if (formData.candidate_id && !initialData) {
            // Fix: lookup candidate by user_id to match the value stored in candidate_id state
            const candidate = candidates.find(c => c.user_id === formData.candidate_id);
            if (candidate) {
                setFormData(prev => ({ ...prev, job_id: candidate.job_id }));
            }
        }
    }, [formData.candidate_id, candidates, initialData]);

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
            const { candidate_id, job_id, date, time, type, meeting_link, notes } = formData;

            if (!candidate_id || !job_id) {
                throw new Error('Please select a valid candidate and job.');
            }

            const dateTime = new Date(`${date}T${time}`).toISOString();

            if (!user || !user.id) throw new Error('User authentication missing');

            let result;
            if (initialData) {
                // UPDATE existing interview
                const { data, error } = await supabase
                    .from('interviews')
                    .update({
                        date_time: dateTime,
                        type,
                        meeting_link,
                        notes,
                    })
                    .eq('id', initialData.id)
                    .select()
                    .single();

                if (error) throw error;
                result = data;
            } else {
                // INSERT new interview
                const { data, error } = await supabase
                    .from('interviews')
                    .insert({
                        recruiter_id: user.id,
                        candidate_id,
                        job_id,
                        date_time: dateTime,
                        type,
                        meeting_link,
                        notes,
                        status: 'scheduled'
                    })
                    .select()
                    .single();

                if (error) throw error;
                result = data;

                // Update application status to 'interview' (only on new schedule)
                await supabase
                    .from('applications')
                    .update({ status: 'interview' })
                    .eq('user_id', candidate_id)
                    .eq('job_id', job_id);
            }

            onInterviewScheduled(result);
            onClose();
        } catch (err) {
            console.error('Error saving interview:', err);
            setError(err.message || 'Failed to save interview');
        } finally {
            setLoading(false);
        }
    };

    const interviewTypeOptions = [
        { value: 'video', label: 'Video Call' },
        { value: 'phone', label: 'Phone Call' },
        { value: 'in-person', label: 'In-Person' },
        { value: 'technical', label: 'Technical Assessment' }
    ];

    const candidateOptions = candidates.map(c => ({
        value: c.user_id, // Use user_id as candidate_id
        label: `${c.name} - ${c.position}`
    }));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">
                        {initialData ? 'Reschedule Interview' : 'Schedule Interview'}
                    </h2>
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
                        <Select
                            label="Candidate"
                            options={candidateOptions}
                            value={formData.candidate_id}
                            onChange={(val) => setFormData(prev => ({ ...prev, candidate_id: val }))}
                            placeholder="Select a candidate"
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Date"
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Time"
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Select
                            label="Interview Type"
                            options={interviewTypeOptions}
                            value={formData.type}
                            onChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                        />

                        <Input
                            label="Meeting Link / Location"
                            name="meeting_link"
                            value={formData.meeting_link}
                            onChange={handleChange}
                            placeholder="e.g. https://meet.google.com/..."
                        />

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Interview focus, questions, etc."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading}>
                                {initialData ? 'Reschedule' : 'Schedule'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScheduleInterviewModal;
