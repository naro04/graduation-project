import React from 'react';

// Logout icon for modal
const LogoutIcon2 = new URL("../images/icons/logout2.png", import.meta.url).href;

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[8px] shadow-lg w-[333px] p-[24px] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon in Circular Container */}
                <div
                    className="w-[64px] h-[64px] rounded-full flex items-center justify-center mb-[20px]"
                    style={{ backgroundColor: '#F3F4F6' }}
                >
                    <img
                        src={LogoutIcon2}
                        alt="Logout"
                        className="w-[24px] h-[24px] object-contain"
                    />
                </div>

                {/* Title */}
                <h2
                    className="mb-[12px] text-center"
                    style={{
                        fontFamily: 'Mali, sans-serif',
                        fontWeight: 600,
                        fontStyle: 'SemiBold',
                        fontSize: '18px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        color: '#000000'
                    }}
                >
                    Log out
                </h2>

                {/* Confirmation Message */}
                <p
                    className="mb-[24px] text-center px-[12px]"
                    style={{
                        fontFamily: 'Mali, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        color: '#717171'
                    }}
                >
                    Are you sure you want to log out of your account?
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-[12px] w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 h-[30px] rounded-[5px] border transition-colors hover:bg-[#F5F7FA]"
                        style={{
                            fontFamily: 'Mali, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '100%',
                            letterSpacing: '0%',
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E0E0E0',
                            color: '#737373'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 h-[30px] rounded-[5px] transition-colors hover:opacity-90"
                        style={{
                            fontFamily: 'Mali, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '100%',
                            letterSpacing: '0%',
                            backgroundColor: '#000000',
                            border: '0.5px solid #000000',
                            color: '#FFFFFF'
                        }}
                    >
                        Log out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
