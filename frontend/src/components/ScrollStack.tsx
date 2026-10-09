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
  /** Jarak lipatan antar kartu bertumpuk (px). Kecil = rilis nyaris serentak. */
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
  itemStackDistance = 12,
  stackPosition = '18%',
  scaleEndPosition: _scaleEndPosition = '10%',
  baseScale: _baseScale = 0.85,
  scaleDuration: _scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = true,
  onStackComplete,
}: ScrollStackProps) => {
  void _itemScale;
  void _baseScale;
  void _scaleDuration;
  void _scaleEndPosition;
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const stackCompletedRef = useRef(false);
  const cardsRef = useRef<HTMLElement[]>([]);
  // Posisi layout asli (tepi atas). Aman dibaca langsung setiap saat:
  // tidak ada translate yang menggeser rect, dan scale ber-origin
  // top-center sehingga tepi atas tidak bergerak.
  const cardTopsRef = useRef<number[]>([]);
  const endTopRef = useRef(0);
  const topIndexRef = useRef(-1);
  // Pinning hanya di layar ≥640px (kartu muat di bawah header sticky).
  // Di layar kecil: kartu statis berurutan + glow aktif saja.
  const pinEnabledRef = useRef(true);

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

  // Tinggi header sticky seksi (0 bila tidak ada / mode non-pinning).
  const getHeaderHeight = useCallback(() => {
    const root = scrollerRef.current;
    const header = root
      ?.closest('section')
      ?.querySelector<HTMLElement>('.how-sticky-header');
    return header ? header.offsetHeight : 0;
  }, []);

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

  // Kartu menempel tepat di bawah header sticky, berlipat tipis.
  // Ditulis seperlunya (mount/resize), BUKAN per-frame.
  const applyCardTops = useCallback(() => {
    if (!pinEnabledRef.current) {
      cardsRef.current.forEach((card) => {
        if (!card) return;
        card.style.position = 'relative';
        card.style.top = 'auto';
        card.style.removeProperty('--ss');
        card.style.removeProperty('--sr');
        card.style.filter = '';
      });
      return;
    }
    const base = getHeaderHeight() + 16;
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      card.style.position = 'sticky';
      card.style.top = `${Math.round((base + itemStackDistance * i) * 100) / 100}px`;
    });
  }, [getHeaderHeight, itemStackDistance]);

  // State machine stepped: hanya menulis DOM saat indeks kartu teratas
  // BERUBAH. Teks kartu yang sudah nempel TIDAK PERNAH bergerak (skala
  // selalu 1); hanya kartu yang tiba tumbuh 0.94 → 1 saat meluncur masuk.
  const updateStackState = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;
    if (cardTopsRef.current.length !== cards.length) {
      measureOffsets();
    }

    const { scrollTop, containerHeight } = getScrollData();
    const stackPx = parsePercentage(stackPosition, containerHeight);
    const pin = pinEnabledRef.current;

    let top = 0;
    for (let j = 0; j < cardTopsRef.current.length; j++) {
      const jTop = cardTopsRef.current[j] ?? 0;
      const pinAt = pin ? jTop - (getHeaderHeight() + 16 + itemStackDistance * j) : jTop - stackPx;
      if (scrollTop >= pinAt) {
        top = j;
      }
    }

    if (top !== topIndexRef.current) {
      topIndexRef.current = top;
      cards.forEach((card, i) => {
        if (!card) return;
        if (pin) {
          // Depan penuh; yang tiba tumbuh masuk; yang di belakang diam di 1.
          const scale = i <= top ? 1 : 0.94;
          const prev = card.style.getPropertyValue('--ss');
          const next = i <= top ? '' : String(scale);
          if ((prev || '') !== next) {
            if (next) {
              card.style.setProperty('--ss', next);
            } else {
              card.style.removeProperty('--ss');
            }
          }
          if (rotationAmount) {
            card.style.setProperty('--sr', '0deg');
          }
          if (blurAmount) {
            card.style.filter = '';
          }
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
    rotationAmount,
    blurAmount,
    itemStackDistance,
    onStackComplete,
    parsePercentage,
    getScrollData,
    getHeaderHeight,
    measureOffsets,
  ]);

  const refresh = useCallback(() => {
    pinEnabledRef.current =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(min-width: 640px)').matches
        : true;
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
        card.style.removeProperty('--ss');
        card.style.removeProperty('--sr');
        card.style.filter = '';
      });
      return () => {
        cardsRef.current = [];
        cardTopsRef.current = [];
        topIndexRef.current = -1;
      };
    }

    // Terapkan top + state awal sebelum paint pertama.
    refresh();

    const handleLoad = () => refresh();

    // Scroll handler ringan: hanya aritmetika + tulis saat state berubah.
    const handleScroll = () => updateStackState();

    if (useWindowScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleLoad);
    } else {
      root.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleLoad);
    }
    window.addEventListener('load', handleLoad);
    // Guard rantai penuh: tidak pernah throw walau API fonts tak lengkap.
    const fontsReady = (
      document as Document & { fonts?: { ready?: Promise<unknown> } }
    ).fonts?.ready;
    fontsReady?.then(handleLoad, () => {});

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => refresh());
      resizeObserver.observe(root);
    }

    // Jaminan cache segar tepat sebelum section terlihat.
    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            refresh();
          }
        },
        { rootMargin: '40% 0px 40% 0px' }
      );
      intersectionObserver.observe(root);
    }

    return () => {
      if (useWindowScroll) {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleLoad);
      } else {
        root.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleLoad);
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
    itemStackDistance,
    stackPosition,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    refresh,
    updateStackState,
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
