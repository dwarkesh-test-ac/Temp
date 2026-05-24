import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function ad_runner({ children, Code }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [timesing, setTimesing] = useState(true);
  const [cross, setCross] = useState(false);
  const [cundown, setCundown] = useState("");
  const [adlink, setAdlink] = useState("");
  const [targetlink, settargetlink] = useState("");
  const [resetskip, setresetskip] = useState(0);
  const [inactiveter, setinactiveter] = useState(0)
  const timerRef = useRef(null);
  const inactivity_time = 5000;
  const skiptime = 1;
  let skiptimetemp = skiptime;

  // Skip button display timeing
  const skipstart = () => {
    setTimesing(true);
    // setShowOverlay(true);
    if (!showOverlay) setShowOverlay(true)
    setCross(false);
    for (let index = skiptime; index >= 0; index--) {
      setTimeout(() => {
        console.log("timeout:", index);
        setCundown(index);
        if (index == 0) {
          setTimesing(false);
          setCross(true);
        }
      }, (skiptimetemp - index) * 1000);
    }
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setinactiveter(0)
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // setShowOverlay(false);

    timerRef.current = setTimeout(() => {
      // setShowOverlay(true);
      skipstart();
      // console.log("No interaction for 5 seconds")  ;
    }, inactivity_time);
  };

  useEffect(() => {
    // When the overlay is visible we *disable* the listeners
    if (showOverlay) {
      // clean any pending timeout so the overlay isn’t triggered again
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "touchmove",
      "scroll",
      "wheel",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    // Start when page loads
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [showOverlay]);

  useEffect(() => {
    if (showOverlay && inactiveter === 0) {
      const fetchData = async () => {
        try {
          let result = await axios.get(`https://ad-services.vercel.app/api/ad/fetch-ad?url=https://jsonplaceholder.typicode.com/posts&apiKey=${Code}&limit=1`);
          setAdlink(result.data.ad_link)
          settargetlink(result.data.target_link)
          setinactiveter(1);
        } catch (err) {
          console.error(err.response?.status, err.response?.data, err.response?.headers);
        }
      };
      fetchData();
    }
  }, [showOverlay, inactiveter]);

  const redirectto = () => {

    try {
      axios.get("/api/ad/clicks-advertiser");
    } catch (err) {
     console.error(err.response?.status, err.response?.data, err.response?.headers);
    }finally{
      window.location.href = targetlink;
    }
    
  }

  return (
    <div className="app relative">
      {children}

      {showOverlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={redirectto}
        >
          <div
            className="relative w-full max-w-3xl mx-4 bg-white/95 rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-white/60 backdrop-blur-sm border-b border-black/5">
              <div className="text-sm text-slate-700 font-semibold" onClick={redirectto}>Ad run by Dwarkesh & team</div>

              <div className="flex items-center gap-3">
                {timesing && (
                  <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium shadow-sm">
                    {cundown}
                  </div>
                )}

                {cross && (
                  <button
                    type="button"
                    onClick={closeOverlay}
                    className="h-9 w-9 absolute right-4 rounded-full bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 transition ring-1 ring-black/5 shadow-sm z-52 cursor-pointer"
                    aria-label="Close"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Media area */}
            <div className="w-full h-[60vh] md:h-[75vh] lg:h-[85vh] xl:h-[88vh] flex items-center justify-center overflow-hidden bg-black">
              <div className=" h-[90%] w-full absolute cursor-pointer bottom-2.5" onClick={redirectto}></div>
              {/* If adlink ends with common image ext or content-type is image, render as <img> */}
              {/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(adlink) ? (
                <img
                  src={adlink}
                  alt="Ad"
                  className="max-w-full max-h-full object-contain"
                  draggable={false}
                />
              ) : (
                <iframe
                  className="w-full h-full border-0"
                  src={adlink}
                  title="Ad"
                  allow="autoplay; fullscreen"
                />
              )}
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur-sm border-t border-black/5">
              <div className="text-xs text-slate-500">Sponsored</div>
              <div className="text-xs text-slate-500">Click anywhere to continue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
