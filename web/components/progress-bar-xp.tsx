function ProgressBar({ progress }: { progress: number }) {
    // let maxProgress;

//   if (progress <= 5000) {
//     maxProgress = 5000;
//   } else if (progress <= 11000) {
//     maxProgress = 11000;
//   } else if (progress <= 18000) {
//     maxProgress = 18000;
//   } else if (progress <= 26000) {
//     maxProgress = 26000;
//     } else if (progress <= 35000) {
//     maxProgress = 35000;
//     } else if (progress <= 45000) {
//     maxProgress = 45000;
//     } else if (progress <= 56000) {
//     maxProgress = 56000;
//     } else if (progress <= 68000) {
//     maxProgress = 68000;
//     } else if (progress <= 81000) {
//     maxProgress = 81000;
//     } else if (progress <= 95000) {
//     maxProgress = 95000;
//     } else if (progress <= 110000) {
//     maxProgress = 110000;
//     } else if (progress <= 126000) {
//     maxProgress = 126000;
//     } else if (progress <= 143000) {
//     maxProgress = 143000;
//     } else if (progress <= 161000) {
//     maxProgress = 161000;
//     } else if (progress <= 180000) {
//     maxProgress = 180000;
//     } else if (progress <= 200000) {
//     maxProgress = 200000;
//     } else if (progress <= 221000) {
//     maxProgress = 221000;
//     } else if (progress <= 243000) {
//     maxProgress = 243000;
//     }   else {
//         console.log('finished');
        
//     }
    const thresholds = [5000, 11000, 18000, 26000, 35000, 45000, 56000, 68000, 81000, 95000, 110000, 126000, 143000, 161000, 180000, 200000, 221000, 243000];

    let maxProgress = thresholds.find(threshold => progress <= threshold);
    
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