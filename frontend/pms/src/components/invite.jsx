import React, { useState } from 'react';

const InviteModal = ({ isOpen, onClose }) => {
  const [inviteMethod, setInviteMethod] = useState('link');
  const [email, setEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('Member');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invite Team Member</h2>
        </div>
        
        <div className="modal-body">
          {/* Invite with link section */}
          <div className="invite-section">
            <p className={`invite-method ${inviteMethod === 'link' ? 'active' : ''}`} 
              onClick={() => setInviteMethod('link')}>
              Invite with link
            </p>
            
            {inviteMethod === 'link' && (
              <div className="invite-link-container">
                <input 
                  type="text" 
                  value="https://groupname.com/users/signup/invite" 
                  readOnly
                />
                <button className="copy-button">Copy</button>
              </div>
            )}
          </div>
          
          {/* Invite with email section */}
          <div className="invite-section">
            <p className={`invite-method ${inviteMethod === 'email' ? 'active' : ''}`} 
              onClick={() => setInviteMethod('email')}>
              Invite member using email address
            </p>
            
            {inviteMethod === 'email' && (
              <div className="invite-email-container">
                <input 
                  type="email" 
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="access-level-options">
                  <span 
                    className={`access-option ${accessLevel === 'Member' ? 'selected' : ''}`}
                    onClick={() => setAccessLevel('Member')}>
                    Member
                  </span>
                  <span 
                    className={`access-option ${accessLevel === 'View-only' ? 'selected' : ''}`}
                    onClick={() => setAccessLevel('View-only')}>
                    View-only
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="invite-button" onClick={onClose}>
            Invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;