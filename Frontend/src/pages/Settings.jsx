import { Settings as SettingsIcon, Bell, Shield, Eye, Moon, Monitor } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  return (
    <div className="page-container settings-page">
      <div className="container">
        <div className="page-header">
          <h1>Account <span className="text-gradient">Settings</span></h1>
          <p>Manage your preferences and privacy controls.</p>
        </div>

        <div className="settings-layout">
          {/* Settings Sidebar Nav (Mockup) */}
          <div className="settings-nav">
            <button className="settings-tab active"><SettingsIcon size={18} /> General</button>
            <button className="settings-tab"><Shield size={18} /> Privacy & Security</button>
            <button className="settings-tab"><Bell size={18} /> Notifications</button>
            <button className="settings-tab"><Eye size={18} /> Appearance</button>
          </div>

          {/* Settings Content */}
          <div className="settings-content glass-card">
            
            <div className="settings-section">
              <h3>Theme & Appearance</h3>
              <p className="section-desc">Customize how Zenith Health looks on your device.</p>
              
              <div className="theme-options">
                <div className="theme-card active">
                  <Moon size={24} className="mb-2" />
                  <span>Dark Theme</span>
                </div>
                <div className="theme-card">
                  <Monitor size={24} className="mb-2" />
                  <span>System Default</span>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Camera Permissions</h3>
              <p className="section-desc">Manage how Zenith accesses your device camera.</p>
              
              <div className="setting-toggle-row">
                <div className="toggle-info">
                  <h4>Allow Camera Access</h4>
                  <p>Required for live form tracking and mood detection.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="setting-toggle-row">
                <div className="toggle-info">
                  <h4>Local Processing Only</h4>
                  <p>Ensures video data never leaves your device. (Recommended)</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked disabled />
                  <span className="slider disabled"></span>
                </label>
              </div>
            </div>

            <div className="settings-section border-none">
              <h3>Notifications</h3>
              <p className="section-desc">Choose what updates you want to receive.</p>
              
              <div className="setting-toggle-row">
                <div className="toggle-info">
                  <h4>Workout Reminders</h4>
                  <p>Get notified when it's time for your scheduled session.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              
              <div className="setting-toggle-row">
                <div className="toggle-info">
                  <h4>Weekly Reports</h4>
                  <p>Receive a summary of your health score and activity.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
