import Image from "next/image";
import Link from "next/link";

export interface ContributorCardProps {
  avatar: string;
  username: string;
  contributions: number;
  profileUrl: string;
}

export default function ContributorCard({
  avatar,
  username,
  contributions,
  profileUrl,
}: ContributorCardProps) {
  return (
    <article className="w-full max-w-xs mx-auto rounded-2xl p-5 shadow-raised bg-background transition-shadow duration-[400ms] ease-out">
      <Link
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center text-center gap-2 sm:gap-3 no-underline text-inherit w-full h-full"
      >
        <Image
          src={avatar}
          alt={`${username} avatar`}
          width={56}
          height={56}
          className="w-14 h-14 rounded-full object-cover shrink-0"
        />
        <h3 className="text-base font-semibold text-text-primary break-words text-center">
          {username}
        </h3>
        <p className="text-sm text-text-secondary">
          {contributions}{" "}
          {contributions === 1 ? "contribution" : "contributions"}
        </p>
      </Link>
    </article>
  );
}
