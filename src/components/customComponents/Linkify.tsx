import Link from "next/link";
import React from "react";
import { LinkItUrl, LinkIt } from "react-linkify-it";
import UserLinkWithTooltip from "./UserLinkWithTooltip";
interface LinkifyProps {
  children: React.ReactNode;
}

function Linkify({ children }: LinkifyProps) {
  return (
    <LinkifyUsername>
      <LinkifyHastags>
        <LinkifyUrl>{children}</LinkifyUrl>
      </LinkifyHastags>
    </LinkifyUsername>
  );
}

export default Linkify;

function LinkifyUrl({ children }: LinkifyProps) {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
}
function LinkifyUsername({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => (
        <UserLinkWithTooltip key={key} username={match.slice(1)}>
          <Link
            key={key}
            href={`/users/${match.slice(1)}`}
            className="text-primary hover:underline"
            suppressHydrationWarning
          >
            {match}
          </Link>
        </UserLinkWithTooltip>
      )}
    >
      {children}
    </LinkIt>
  );
}

function LinkifyHastags({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9]+)/}
      component={(match, key) => (
        <Link
          key={key}
          href={`/hashtags/${match.slice(1)}`}
          className="text-primary hover:underline"
          suppressHydrationWarning
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
}
