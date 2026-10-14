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
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
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
  const cardTopsRef = useRef<number[]>([]);
  const endTopRef = useRef(0);
  const topIndexRef = useRef(-1);
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
    const { containerHeight } = getScrollData();
    const stackPx = parsePercentage(stackPosition, containerHeight);
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      card.style.position = 'sticky';
      card.style.top = `${Math.round((stackPx + itemStackDistance * i) * 100) / 100}px`;
    });
  }, [getScrollData, parsePercentage, stackPosition, itemStackDistance]);

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
      const pinAt = pin
        ? jTop - (stackPx + itemStackDistance * j)
        : jTop - stackPx;
      if (scrollTop >= pinAt) {
        top = j;
      }
    }

    if (top !== topIndexRef.current) {
      topIndexRef.current = top;
      cards.forEach((card, i) => {
        if (!card) return;
        if (pin) {
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
      card.style.zIndex = String(i + 1);
    });

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

    refresh();

    const handleLoad = () => refresh();

    const handleScroll = () => updateStackState();

    if (useWindowScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleLoad);
    } else {
      root.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleLoad);
    }
    window.addEventListener('load', handleLoad);
    const fontsReady = (
      document as Document & { fonts?: { ready?: Promise<unknown> } }
    ).fonts?.ready;
    fontsReady?.then(handleLoad, () => {});

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => refresh());
      resizeObserver.observe(root);
    }

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
        <div className="scroll-stack-end" aria-hidden="true" />
      </div>
    </div>
  );
};

export default ScrollStack;
