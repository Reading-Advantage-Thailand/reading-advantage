function ProgressBar({ progress, level}: { progress: number, level: number }) {
    const xp = [5000, 11000, 18000, 26000, 35000, 45000, 56000, 68000, 81000, 95000, 110000, 126000, 143000, 161000, 180000, 200000, 221000, 243000];

    let maxProgress = xp.find(xp => progress <= xp);
    
    if (!maxProgress) {
      console.log('finished');
      maxProgress = progress; // or some default value
    }

    return (
      <div className="gap-2 justify-center w-[55%] flex md:w-[60%]">
        <p>XP:</p>
      <div className="w-[55%] bg-[#f3f3f3] rounded-xl md:w-[60%]">
        <div className="sm:h-4 w-full rounded-xl" style={{ width: `${(progress * 100)/(maxProgress || 1)}%`, 
        backgroundColor: 'blue', 
        height: '22px', 
        borderRadius: '10px',
        animationName: 'progress-bar-animation',
        animationDuration: '5s',
        animationTimingFunction: 'infinite',
        animationFillMode: 'forwards',
        
        }} />
      </div>
        <p className="hidden md:block">Level {level}  </p>
      </div>
      
    );
  }

export default ProgressBar;