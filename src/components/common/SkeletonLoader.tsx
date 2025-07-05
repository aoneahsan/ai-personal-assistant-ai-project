import { Skeleton } from 'primereact/skeleton';
import React from 'react';

export interface SkeletonLoaderProps {
  type: 'list' | 'card' | 'table' | 'custom';
  count?: number;
  className?: string;
  showAvatar?: boolean;
  avatarSize?: string;
  lineCount?: number;
  children?: React.ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  count = 3,
  className = '',
  showAvatar = true,
  avatarSize = '3rem',
  lineCount = 2,
  children,
}) => {
  if (type === 'custom') {
    return <>{children}</>;
  }

  const renderListItem = (index: number) => (
    <div
      key={index}
      className='flex align-items-center gap-3 p-3'
    >
      {showAvatar && (
        <Skeleton
          shape='circle'
          size={avatarSize}
        />
      )}
      <div className='flex-1'>
        {[...Array(lineCount)].map((_, lineIndex) => (
          <Skeleton
            key={lineIndex}
            width={lineIndex === 0 ? '200px' : '150px'}
            height={lineIndex === 0 ? '1rem' : '0.8rem'}
            className={lineIndex === 0 ? 'mb-2' : ''}
          />
        ))}
      </div>
    </div>
  );

  const renderCardItem = (index: number) => (
    <div
      key={index}
      className='p-3 border-round-lg surface-border border-1 mb-3'
    >
      <div className='flex align-items-center gap-3 mb-3'>
        {showAvatar && (
          <Skeleton
            shape='circle'
            size={avatarSize}
          />
        )}
        <div className='flex-1'>
          <Skeleton
            width='150px'
            height='1rem'
            className='mb-2'
          />
          <Skeleton
            width='100px'
            height='0.8rem'
          />
        </div>
      </div>
      <Skeleton
        width='100%'
        height='4rem'
        className='mb-2'
      />
      <div className='flex gap-2'>
        <Skeleton
          width='80px'
          height='2rem'
        />
        <Skeleton
          width='80px'
          height='2rem'
        />
      </div>
    </div>
  );

  const renderTableItem = (index: number) => (
    <tr key={index}>
      {[...Array(4)].map((_, colIndex) => (
        <td
          key={colIndex}
          className='p-3'
        >
          {colIndex === 0 && showAvatar ? (
            <div className='flex align-items-center gap-3'>
              <Skeleton
                shape='circle'
                size='2rem'
              />
              <Skeleton
                width='120px'
                height='1rem'
              />
            </div>
          ) : (
            <Skeleton
              width='100px'
              height='1rem'
            />
          )}
        </td>
      ))}
    </tr>
  );

  const renderItems = () => {
    return [...Array(count)].map((_, index) => {
      switch (type) {
        case 'list':
          return renderListItem(index);
        case 'card':
          return renderCardItem(index);
        case 'table':
          return renderTableItem(index);
        default:
          return renderListItem(index);
      }
    });
  };

  if (type === 'table') {
    return (
      <table className={`w-full ${className}`}>
        <tbody>{renderItems()}</tbody>
      </table>
    );
  }

  return <div className={`space-y-3 ${className}`}>{renderItems()}</div>;
};

export default SkeletonLoader;
