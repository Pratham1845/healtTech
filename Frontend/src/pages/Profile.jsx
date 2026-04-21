import { useState } from 'react';
import { User, Target, Shield, Heart } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [vitals, setVitals] = useState({ age: '28', height: '180 cm', weight: '75 kg' });

  const handleVitalsChange = (field, value) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  const handleVitalsButton = () => {
    setIsEditingVitals((prev) => !prev);
  };

  return (
    <div className="page-container profile-page">
      <div className="container">
        <div className="page-header">
          <h1>Your <span className="text-gradient">Profile</span></h1>
          <p>Manage your health profile and fitness goals.</p>
        </div>

        <div className="profile-layout">
          {/* User Card */}
          <div className="profile-sidebar">
            <div className="user-card glass-card">
              <div className="user-avatar-large">
                <User size={48} />
              </div>
              <h2>Alex Mercer</h2>
              <p className="user-email">alex@example.com</p>
              <div className="user-badges">
                <span className="badge-premium"><Shield size={14} /> Premium Member</span>
              </div>
            </div>

            <div className="vitals-card glass-card mt-4">
              <h3>Basic Vitals</h3>
              <div className="vital-item">
                <span className="label">Age</span>
                {isEditingVitals ? (
                  <input
                    className="vital-input"
                    type="text"
                    value={vitals.age}
                    onChange={(event) => handleVitalsChange('age', event.target.value)}
                  />
                ) : (
                  <span className="value">{vitals.age}</span>
                )}
              </div>
              <div className="vital-item">
                <span className="label">Height</span>
                {isEditingVitals ? (
                  <input
                    className="vital-input"
                    type="text"
                    value={vitals.height}
                    onChange={(event) => handleVitalsChange('height', event.target.value)}
                  />
                ) : (
                  <span className="value">{vitals.height}</span>
                )}
              </div>
              <div className="vital-item">
                <span className="label">Weight</span>
                {isEditingVitals ? (
                  <input
                    className="vital-input"
                    type="text"
                    value={vitals.weight}
                    onChange={(event) => handleVitalsChange('weight', event.target.value)}
                  />
                ) : (
                  <span className="value">{vitals.weight}</span>
                )}
              </div>
              <button className="btn btn-secondary w-full mt-4" onClick={handleVitalsButton}>
                {isEditingVitals ? 'Save Vitals' : 'Edit Vitals'}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            <div className="goals-section glass-card">
              <div className="section-header">
                <h3><Target size={20} className="text-accent" /> Active Goals</h3>
                <button className="btn btn-secondary btn-sm">Add Goal</button>
              </div>
              
              <div className="goals-list">
                <div className="goal-card">
                  <div className="goal-info">
                    <h4>Improve Posture (Reduce APT)</h4>
                    <span className="goal-target">Target: 95% perfect form sessions</span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill w-70"></div>
                    </div>
                    <span className="progress-text">70%</span>
                  </div>
                </div>

                <div className="goal-card">
                  <div className="goal-info">
                    <h4>Increase Mobility</h4>
                    <span className="goal-target">Target: 3 stretching sessions / week</span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill w-30 bg-purple"></div>
                    </div>
                    <span className="progress-text">1/3</span>
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
                  <select className="form-select">
                    <option>Posture Correction</option>
                    <option>Strength Training</option>
                    <option>Mobility & Flexibility</option>
                    <option>Cardio & Endurance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Intensity Level</label>
                  <select className="form-select">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <button className="btn btn-primary mt-2">Save Preferences</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
