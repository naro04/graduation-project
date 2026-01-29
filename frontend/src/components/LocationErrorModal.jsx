import React from "react";

const LocationErrorIcon = new URL(
    "../images/icons/4ee7af48cdbd99dd74b51c1d02261258c4b65ee0.png",
    import.meta.url
).href;

const LocationErrorModal = ({ isOpen, onClose, onSelectLocation }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-[500px] flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
                style={{
                    background: "linear-gradient(180deg, #DEFFFC 0%, #CDCDCD 100%)",
                    borderRadius: "0px",
                    // Dimensions from screenshot approx 519x393, using max-w-[500px] and auto height for responsiveness
                    minHeight: "350px"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="mb-6 flex items-center justify-center"
                    style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: "#D9D9D966", // Semi-transparent grey
                        borderRadius: "50%", // Circle
                        padding: "8px"
                    }}
                >
                    <img src={LocationErrorIcon} alt="Location Error" className="w-full h-full object-contain" />
                </div>

                <h2
                    className="text-[18px] mb-2"
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        color: "#00564F",
                        lineHeight: "1.2"
                    }}
                >
                    We couldn't detect your location automatically
                </h2>

                <p
                    className="text-[16px] mb-8 max-w-[80%]"
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        color: "#7A7A7A", // Using the grey color from the screenshot specs
                        lineHeight: "1.2"
                    }}
                >
                    Please select your current work location to continue
                </p>

                <button
                    onClick={onSelectLocation}
                    className="px-6 py-2 bg-transparent rounded-[5px] transition-colors hover:bg-white/20"
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        fontSize: "16px",
                        color: "#000000",
                        backgroundColor: "transparent",
                        border: "1px solid #00564F", // Thinner 1px border
                        borderColor: "#00564F", // Explicit borderColor
                        minWidth: "160px"
                    }}
                >
                    Select Location
                </button>
            </div>
        </div>
    );
};

export default LocationErrorModal;
