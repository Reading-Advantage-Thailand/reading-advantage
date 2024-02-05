function ProgressBar({ progress }: { progress: number }) {
    const xp = [5000, 11000, 18000, 26000, 35000, 45000, 56000, 68000, 81000, 95000, 110000, 126000, 143000, 161000, 180000, 200000, 221000, 243000];

    let maxProgress = xp.find(xp => progress <= xp);
    
    if (!maxProgress) {
      console.log('finished');
      maxProgress = progress; // or some default value
    }

    return (
      <div className="progress-bar" style={{ width: '50%', backgroundColor: '#f3f3f3' }}>
        <div style={{ width: `${(progress * 100)/(maxProgress || 1)}%`, backgroundColor: 'blue', height: '20px' }} />
      </div>
    );
  }

export default ProgressBar;