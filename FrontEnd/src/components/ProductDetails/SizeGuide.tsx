import React from 'react';
import styles from './SizeGuide.module.css'; // Importing the CSS module

interface SizeGuideProps {
  sizeGuide: string[]; // Expecting an array of strings for the size guide
}

const SizeGuide: React.FC<SizeGuideProps> = ({ sizeGuide }) => {
  return (
    <div className={styles.sizeGuideContainer}>
      <p> Attention: Fabrics are stretchy. Some sizes are listed as normal. Consider elasticity.</p>
      <ul className={styles.list}>
        {sizeGuide.map((item, index) => (
          <li key={index} className={styles.listItem}>
            {item.split(',').map((segment, idx) => (
              <span key={idx} style={{ display: 'block' }}>{segment}</span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SizeGuide;
