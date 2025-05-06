import React from "react";
import styles from "./SizeGuide.module.css";

interface SizeGuideProps {
  sizeGuide: unknown; // تغییر داده به unknown برای ایمنی بیشتر
}

const SizeGuide: React.FC<SizeGuideProps> = ({ sizeGuide }) => {
  if (!Array.isArray(sizeGuide)) {
    return <p>No size guide available.</p>;
  }

  return (
    <div className={styles.sizeGuideContainer}>
      <p>
        Attention: Fabrics are stretchy. Some sizes are listed as normal.
        Consider elasticity.
      </p>
      <ul className={styles.list}>
        {sizeGuide.map((item: string, index: number) => (
          <li key={index} className={styles.listItem}>
            {item.split(",").map((segment: string, idx: number) => (
              <span key={idx} style={{ display: "block" }}>
                {segment}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SizeGuide;
