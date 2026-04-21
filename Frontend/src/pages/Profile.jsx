import { useEffect, useState } from 'react';
import { User, Target, Shield, Heart } from 'lucide-react';
import { apiFetch } from '../lib/api';
import './Profile.css';

const Profile = () => {
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/api/auth/profile');
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      }
    };

    load();
  }, []);

  const handleVitalsChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = async () => {
    if (!profile) return;

    if (isEditingVitals) {
      try {
        const updated = await apiFetch('/api/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({
            name: profile.name,
            age: profile.age === '' ? null : Number(profile.age),
            heightCm: profile.heightCm === '' ? null : Number(profile.heightCm),
            weightKg: profile.weightKg === '' ? null : Number(profile.weightKg),
            primaryFocus: profile.primaryFocus,
            intensityLevel: profile.intensityLevel
          })
        });
        setProfile(updated);
      } catch (err) {
        setError(err.message || 'Failed to save profile');
        return;
      }
    }

    setIsEditingVitals((prev) => !prev);
  };

  if (!profile) {
    return <div className="page-container profile-page"><div className="container"><p>Loading profile...</p>{error && <p>{error}</p>}</div></div>;
  }

  return (
    <div className="page-container profile-page">
      <div className="container">
        <div className="page-header">
          <h1>Your <span className="text-gradient">Profile</span></h1>
          <p>Manage your health profile and fitness goals.</p>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="profile-layout">
          <div className="profile-sidebar">
            <div className="user-card glass-card">
              <div className="user-avatar-large">
                <User size={48} />
              </div>
              <h2>{profile.name}</h2>
              <p className="user-email">{profile.email}</p>
              <div className="user-badges">
                <span className="badge-premium"><Shield size={14} /> Active Member</span>
              </div>
            </div>

            <div className="vitals-card glass-card mt-4">
              <h3>Basic Vitals</h3>
              <div className="vital-item">
                <span className="label">Age</span>
                {isEditingVitals ? (
                  <input className="vital-input" type="number" value={profile.age ?? ''} onChange={(e) => handleVitalsChange('age', e.target.value)} />
                ) : (
                  <span className="value">{profile.age ?? '--'}</span>
                )}
              </div>
              <div className="vital-item">
                <span className="label">Height (cm)</span>
                {isEditingVitals ? (
                  <input className="vital-input" type="number" value={profile.heightCm ?? ''} onChange={(e) => handleVitalsChange('heightCm', e.target.value)} />
                ) : (
                  <span className="value">{profile.heightCm ?? '--'}</span>
                )}
              </div>
              <div className="vital-item">
                <span className="label">Weight (kg)</span>
                {isEditingVitals ? (
                  <input className="vital-input" type="number" value={profile.weightKg ?? ''} onChange={(e) => handleVitalsChange('weightKg', e.target.value)} />
                ) : (
                  <span className="value">{profile.weightKg ?? '--'}</span>
                )}
              </div>
              <button className="btn btn-secondary w-full mt-4" onClick={toggleEdit}>
                {isEditingVitals ? 'Save Vitals' : 'Edit Vitals'}
              </button>
            </div>
          </div>

          <div className="profile-main">
            <div className="goals-section glass-card">
              <div className="section-header">
                <h3><Target size={20} className="text-accent" /> Active Goals</h3>
              </div>

              <div className="goals-list">
                <div className="goal-card">
                  <div className="goal-info">
                    <h4>{profile.primaryFocus || 'Posture Correction'}</h4>
                    <span className="goal-target">Intensity: {profile.intensityLevel || 'Beginner'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="health-preferences glass-card mt-4">
              <div className="section-header">
                <h3><Heart size={20} className="text-accent" /> Health Preferences</h3>
              </div>
              <div className="pref-form">
                <div className="form-group">
                  <label>Primary Focus</label>
                  <select className="form-select" value={profile.primaryFocus || 'Posture Correction'} onChange={(e) => handleVitalsChange('primaryFocus', e.target.value)}>
                    <option>Posture Correction</option>
                    <option>Strength Training</option>
                    <option>Mobility & Flexibility</option>
                    <option>Cardio & Endurance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Intensity Level</label>
                  <select className="form-select" value={profile.intensityLevel || 'Beginner'} onChange={(e) => handleVitalsChange('intensityLevel', e.target.value)}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <button className="btn btn-primary mt-2" onClick={toggleEdit}>Save Preferences</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
