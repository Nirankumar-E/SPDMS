import Link from 'next/link';
import AndroidIcon from '@/components/icons/android-icon';
import AppleIcon from '@/components/icons/apple-icon';

const MobileAppBanner = () => {
  return (
    <section className="bg-gray-100 py-6">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          இலவச செயலி பதிவிறக்கம் செய்ய
        </h3>
        <div className="flex justify-center items-center gap-6">
          <Link href="#" className="flex flex-col items-center text-gray-700 hover:text-primary transition-colors">
            <AndroidIcon className="h-12 w-12" />
            <span className="mt-2 text-sm font-semibold">Public App</span>
          </Link>
          <Link href="#" className="flex flex-col items-center text-gray-700 hover:text-primary transition-colors">
            <AppleIcon className="h-12 w-12" />
            <span className="mt-2 text-sm font-semibold">iOS App</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MobileAppBanner;
