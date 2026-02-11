import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  fetchInstructorByUsername,
  fetchInstructorAvailability,
  fetchInstructorPackages,
  fetchInstructorReviews,
} from '@/lib/api';
import { InstructorPage } from './InstructorPage';

interface PageProps {
  params: Promise<{ username: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const instructor = await fetchInstructorByUsername(username);

  if (!instructor) {
    return {
      title: 'Instructor Not Found',
    };
  }

  const fullName = `${instructor.firstName} ${instructor.lastName}`;
  const primaryArea = instructor.serviceAreas?.[0] || '';
  const allAreas = instructor.serviceAreas?.join(', ') || '';
  const title = `${fullName} - Driving Instructor${primaryArea ? ` in ${primaryArea}` : ''}`;
  const description =
    instructor.bio ||
    `Book driving lessons with ${fullName}${allAreas ? ` serving ${allAreas}` : ''}. ` +
      `View availability, prices, packages, and reviews. ${instructor.passRate ? `${instructor.passRate}% pass rate.` : ''}`;

  const url = `https://${username}.indrive.com`;

  return {
    title,
    description,
    keywords: [
      `${fullName}`,
      'driving instructor',
      'driving lessons',
      // Generate keywords for each service area
      ...(instructor.serviceAreas?.flatMap((area) => [
        `driving instructor ${area}`,
        `driving lessons ${area}`,
      ]) || []),
      instructor.vehicleInfo?.transmission === 'automatic' && 'automatic driving lessons',
      instructor.vehicleInfo?.transmission === 'manual' && 'manual driving lessons',
      'learn to drive',
      'book driving lessons',
    ].filter(Boolean) as string[],
    authors: [{ name: fullName }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'profile',
      title,
      description,
      url,
      siteName: 'InDrive',
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      images: instructor.profileImage
        ? [
            {
              url: instructor.profileImage,
              width: 400,
              height: 400,
              alt: `${fullName} - Driving Instructor`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: instructor.coverImage || instructor.profileImage,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      // Local business structured data hint
      'geo.region': 'GB',
      'geo.placename': allAreas,
    },
  };
}

// Generate JSON-LD structured data
function generateStructuredData(
  instructor: NonNullable<Awaited<ReturnType<typeof fetchInstructorByUsername>>>
) {
  const fullName = `${instructor.firstName} ${instructor.lastName}`;
  const url = `https://${instructor.username}.indrive.com`;

  // LocalBusiness + Person schema
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${url}#business`,
        name: `${fullName} - Driving Instructor`,
        description: instructor.bio,
        url,
        telephone: instructor.phone,
        email: instructor.email,
        image: instructor.profileImage,
        priceRange: instructor.lessonTypes?.length
          ? `£${Math.min(...instructor.lessonTypes.map((l) => l.price))}-£${Math.max(...instructor.lessonTypes.map((l) => l.price))}`
          : undefined,
        areaServed: instructor.serviceAreas?.map((area) => ({
          '@type': 'City',
          name: area,
        })),
        aggregateRating: instructor.passRate
          ? {
              '@type': 'AggregateRating',
              ratingValue: (instructor.passRate / 20).toFixed(1), // Convert to 5-star scale
              bestRating: 5,
              worstRating: 1,
              ratingCount: instructor.totalStudentsPassed || 1,
            }
          : undefined,
        makesOffer: instructor.lessonTypes?.map((lesson) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: `${lesson.type} Driving Lesson`,
            description: lesson.description,
          },
          price: lesson.price,
          priceCurrency: 'GBP',
          availability: 'https://schema.org/InStock',
        })),
      },
      {
        '@type': 'Person',
        '@id': `${url}#person`,
        name: fullName,
        givenName: instructor.firstName,
        familyName: instructor.lastName,
        jobTitle: 'Driving Instructor',
        image: instructor.profileImage,
        url,
        worksFor: {
          '@type': 'Organization',
          name: 'InDrive',
          url: 'https://indrive.com',
        },
      },
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: `${fullName} - Driving Instructor`,
        description: instructor.bio,
        inLanguage: 'en-GB',
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://indrive.com#website',
          url: 'https://indrive.com',
          name: 'InDrive',
        },
        about: { '@id': `${url}#person` },
        mainEntity: { '@id': `${url}#business` },
      },
    ],
  };

  return structuredData;
}

export default async function Page({ params }: PageProps) {
  const { username } = await params;
  // Fetch all data in parallel
  const [instructor, availability, packages, reviews] = await Promise.all([
    fetchInstructorByUsername(username),
    fetchInstructorAvailability(username),
    fetchInstructorPackages(username),
    fetchInstructorReviews(username),
  ]);

  if (!instructor) {
    notFound();
  }

  const structuredData = instructor ? generateStructuredData(instructor) : null;

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Client Component with all the interactive UI */}
      <InstructorPage
        instructor={instructor}
        availability={availability}
        packages={packages}
        reviews={reviews}
      />
    </>
  );
}
