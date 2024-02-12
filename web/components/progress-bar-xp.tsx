function ProgressBar({ progress, level}: { progress: number, level: number }) {
    const xp = [5000, 11000, 18000, 26000, 35000, 45000, 56000, 68000, 81000, 95000, 110000, 126000, 143000, 161000, 180000, 200000, 221000, 243000];

    let maxProgress = xp.find(xp => progress <= xp);
    
    if (!maxProgress) {
      console.log('finished');
      maxProgress = progress; // or some default value
    }

    return (
      <div className="flex gap-4 justify-center" style={{ width: '100%' }}>
        <p>XP :  </p>
      <div className="progress-bar" style={{ width: '30%', backgroundColor: '#f3f3f3', borderRadius: '10px' }}>
        <div style={{ width: `${(progress * 100)/(maxProgress || 1)}%`, 
        backgroundColor: 'blue', 
        height: '22px', 
        borderRadius: '10px',
        animationName: 'progress-bar-animation',
        animationDuration: '5s',
        animationTimingFunction: 'infinite',
        animationFillMode: 'forwards'
        }} />
      </div>
        <p>Level {level}  </p>
      </div>
      
    );
  }

export default ProgressBar;