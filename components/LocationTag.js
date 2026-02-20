import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './LocationTag.module.css';

const LocationTag = () => {
  const [showPeruMap, setShowPeruMap] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowPeruMap((prev) => !prev);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.locationTag}>
      <div className={styles.textContainer}>
        <span className={styles.text}>Located in</span>
        <span className={styles.text}>Peru</span>
      </div>
      <div className={styles.mapCircle}>
        <div className={`${styles.mapImage} ${!showPeruMap ? styles.active : styles.inactive}`}>
          <Image
            src="/graficos/globo.png"
            alt="Mapa Mundi"
            width={30}
            height={30}
            className={`${styles.image} ${styles.flipped}`}
          />
        </div>
        <div className={`${styles.mapImage} ${showPeruMap ? styles.active : styles.inactive}`}>
          <Image
            src="/graficos/peru.png"
            alt="Mapa de Perú"
            width={30}
            height={30}
            className={styles.image}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationTag;
