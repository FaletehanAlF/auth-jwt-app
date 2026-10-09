'use client';

import {
  useLayoutEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from 'react';
import './ScrollStack.css';

type ScrollStackItemProps = {
  children: ReactNode;
  itemClassName?: string;
};

export const ScrollStackItem = ({
  children,
  itemClassName = '',
}: ScrollStackItemProps) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

type ScrollStackProps = {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  /** Kompatibilitas API — tidak dipakai pada mode deck (semua kartu satu top). */
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  /** Kompatibilitas API React Bits — tidak dipakai (skala stepped). */
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 240,
  itemScale: _itemScale = 0.05,
  itemStackDistance: _itemStackDistance = 56,
  stackPosition = '18%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration: _scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = true,
  onStackComplete,
}: ScrollStackProps) => {
  void _itemScale;
  void _itemStackDistance;
  void _scaleDuration;
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stackCompletedRef = useRef(false);
  const cardsRef = useRef<HTMLElement[]>([]);
  // Posisi layout asli (tepi atas). Aman dibaca langsung setiap saat:
  // tidak ada translate yang menggeser rect, dan scale ber-origin
  // top-center sehingga tepi atas tidak bergerak.
  const cardTopsRef = useRef<number[]>([]);
  const endTopRef = useRef(0);
  const topIndexRef = useRef(-1);

  const parsePercentage = useCallback(
    (value: string, containerHeight: number) => {
      if (typeof value === 'string' && value.includes('%')) {
        return (parseFloat(value) / 100) * containerHeight;
      }
      return parseFloat(value);
    },
    []
  );

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
      };
    }
    const scroller = scrollerRef.current;
    return {
      scrollTop: scroller ? scroller.scrollTop : 0,
      containerHeight: scroller ? scroller.clientHeight : 0,
    };
  }, [useWindowScroll]);

  const measureOffsets = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;
    if (useWindowScroll) {
      const scrollY = window.scrollY;
      cardTopsRef.current = cards.map((card) =>
        card ? card.getBoundingClientRect().top + scrollY : 0
      );
      const endElement =
        scrollerRef.current?.querySelector('.scroll-stack-end');
      endTopRef.current =
        endElement instanceof HTMLElement
          ? endElement.getBoundingClientRect().top + scrollY
          : 0;
    } else {
      cardTopsRef.current = cards.map((card) =>
        card ? card.offsetTop : 0
      );
      const root = scrollerRef.current;
      const endElement = root?.querySelector('.scroll-stack-end');
      if (root && endElement instanceof HTMLElement) {
        endTopRef.current = endElement.offsetTop;
      }
    }
  }, [useWindowScroll]);

  // Satu top yang SAMA untuk semua kartu → lepas sebagai satu unit.
  const applyCardTops = useCallback(() => {
    const { containerHeight } = getScrollData();
    const stackPx = parsePercentage(stackPosition, containerHeight);
    const top = `${Math.round(stackPx * 100) / 100}px`;
    cardsRef.current.forEach((card) => {
      if (card) card.style.top = top;
    });
  }, [getScrollData, parsePercentage, stackPosition]);

  // State machine stepped: hanya menulis DOM saat indeks kartu teratas
  // BERUBAH (maksimal beberapa kali per traversal). Tidak ada tulis
  // per-frame → mustahil geter. Animasi dihaluskan CSS transition.
  const updateStackState = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;
    if (cardTopsRef.current.length !== cards.length) {
      measureOffsets();
    }

    const { scrollTop, containerHeight } = getScrollData();
    const stackPx = parsePercentage(stackPosition, containerHeight);

    let top = 0;
    for (let j = 0; j < cardTopsRef.current.length; j++) {
      const jTop = cardTopsRef.current[j] ?? 0;
      if (scrollTop >= jTop - stackPx) {
        top = j;
      }
    }

    if (top !== topIndexRef.current) {
      topIndexRef.current = top;
      const n = cards.length;
      cards.forEach((card, i) => {
        if (!card) return;
        const behind = Math.max(0, top - i);
        // Kartu depan penuh, makin ke belakang makin kecil hingga baseScale.
        const scale =
          behind === 0
            ? 1
            : 1 - (behind * (1 - baseScale)) / Math.max(1, n - 1);
        card.style.setProperty(
          '--ss',
          String(Math.round(scale * 1000) / 1000)
        );
        if (rotationAmount) {
          card.style.setProperty(
            '--sr',
            behind === 0 ? '0deg' : `${i * rotationAmount}deg`
          );
        }
        if (blurAmount && behind > 0) {
          card.style.filter = `blur(${behind * blurAmount}px)`;
        } else if (blurAmount) {
          card.style.filter = '';
        }
        const isActive = i === top;
        if ((card.dataset.active === 'true') !== isActive) {
          if (isActive) {
            card.dataset.active = 'true';
          } else {
            delete card.dataset.active;
          }
        }
      });
    }

    const lastTop = cardTopsRef.current[cards.length - 1] ?? 0;
    const pinStart = lastTop - stackPx;
    const pinEnd = endTopRef.current - containerHeight / 2;
    const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
    if (isInView && !stackCompletedRef.current) {
      stackCompletedRef.current = true;
      onStackComplete?.();
    } else if (!isInView && stackCompletedRef.current) {
      stackCompletedRef.current = false;
    }
  }, [
    stackPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    parsePercentage,
    getScrollData,
    measureOffsets,
  ]);

  const handleResize = useCallback(() => {
    applyCardTops();
    measureOffsets();
    // Paksa evaluasi ulang state setelah layout berubah.
    topIndexRef.current = -1;
    updateStackState();
  }, [applyCardTops, measureOffsets, updateStackState]);

  useLayoutEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>('.scroll-stack-card')
    );

    cardsRef.current = cards;

    cards.forEach((card, i) => {
      card.style.position = 'sticky';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      // Tumpukan eksplisit: kartu awal di belakang, kartu akhir di depan.
      card.style.zIndex = String(i + 1);
    });

    // Fallback ramah reduced-motion: kartu tampil statis bertumpuk
    // normal tanpa efek dan tanpa listener scroll.
    if (prefersReducedMotion()) {
      cards.forEach((card) => {
        card.style.position = 'relative';
        card.style.top = 'auto';
      });
      return () => {
        cardsRef.current = [];
        cardTopsRef.current = [];
        topIndexRef.current = -1;
      };
    }

    // Terapkan top + state awal sebelum paint pertama.
    applyCardTops();
    measureOffsets();
    updateStackState();

    const remeasure = () => {
      measureOffsets();
      topIndexRef.current = -1;
      updateStackState();
    };
    const handleLoad = () => remeasure();

    // Scroll handler ringan: hanya aritmetika + tulis saat state berubah.
    const handleScroll = () => updateStackState();

    if (useWindowScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
    } else {
      root.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
    }
    window.addEventListener('load', handleLoad);
    // Guard rantai penuh: tidak pernah throw walau API fonts tak lengkap.
    const fontsReady = (
      document as Document & { fonts?: { ready?: Promise<unknown> } }
    ).fonts?.ready;
    fontsReady?.then(handleLoad, () => {});

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => remeasure());
      resizeObserver.observe(root);
    }

    // Jaminan cache segar tepat sebelum section terlihat.
    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            remeasure();
          }
        },
        { rootMargin: '40% 0px 40% 0px' }
      );
      intersectionObserver.observe(root);
    }

    return () => {
      if (useWindowScroll) {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      } else {
        root.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      }
      window.removeEventListener('load', handleLoad);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      stackCompletedRef.current = false;
      cardsRef.current = [];
      cardTopsRef.current = [];
      endTopRef.current = 0;
      topIndexRef.current = -1;
    };
  }, [
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    applyCardTops,
    measureOffsets,
    updateStackState,
    handleResize,
  ]);

  return (
    <div
      className={`scroll-stack-scroller ${className}`.trim()}
      ref={scrollerRef}
      style={{ '--stack-gap': `${itemDistance}px` } as CSSProperties}
    >
      <div className="scroll-stack-inner">
        {children}
        {/* Penahan: tumpukan selesai & utuh dulu sebelum lepas ke Footer */}
        <div className="scroll-stack-end" aria-hidden="true" />
      </div>
    </div>
  );
};

export default ScrollStack;
