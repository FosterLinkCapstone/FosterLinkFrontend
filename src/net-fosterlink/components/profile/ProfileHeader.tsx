import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Ban, ShieldAlert, ShieldCheck } from "lucide-react";
import { getInitials } from "../../util/StringUtil";
import { formatDate } from "../../util/DateUtil";
import { VerifiedCheck } from "../VerifiedCheck";
import type { ProfileMetadataModel } from "../../backend/models/ProfileMetadataModel";
import type { AccountDeletionRequestModel } from "../../backend/models/AccountDeletionRequestModel";
import { useAuth } from "../../backend/AuthContext";

export interface ProfileDisplayInfo {
  username: string;
  fullName: string;
  profilePicUrl?: string;
  joinedText: string;
  joinedTooltip: string;
  verified: boolean;
  banned: boolean;
  restricted: boolean;
}

interface ProfileHeaderProps {
  display: ProfileDisplayInfo;
  profileMetadata: ProfileMetadataModel | null;
  isOwnProfile: boolean;
  isLoadingWithInitialRender: boolean;
  myDeletionRequest: AccountDeletionRequestModel | null | undefined;
  auth: ReturnType<typeof useAuth>;
  onBan: () => void;
  onUnban: () => void;
  onRestrict: () => void;
  onUnrestrict: () => void;
  onCancelDeletion: () => void;
  onAgencyClick: () => void;
  onNavigateAdmin: () => void;
}

export const ProfileHeader = ({
  display,
  profileMetadata,
  isOwnProfile,
  isLoadingWithInitialRender,
  myDeletionRequest,
  auth,
  onBan,
  onUnban,
  onRestrict,
  onUnrestrict,
  onCancelDeletion,
  onAgencyClick,
  onNavigateAdmin,
}: ProfileHeaderProps) => (
  <div className="flex flex-col items-center text-center mb-10">
    <Avatar className="h-28 w-28 mb-4">
      <AvatarImage src={display.profilePicUrl} alt={display.username} />
      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
        {getInitials(display.fullName)}
      </AvatarFallback>
    </Avatar>

    <div className="flex items-center gap-2 mb-1">
      <h1 className="text-2xl font-semibold">{display.fullName}</h1>
      {display.verified && <VerifiedCheck className="h-5 w-5" />}
    </div>

    <div className="text-muted-foreground mb-2">@{display.username}</div>

    <div className="text-sm text-muted-foreground mb-4" title={display.joinedTooltip}>
      {display.joinedText}
    </div>

    {/* Badges — only shown after full profile loads */}
    {profileMetadata && (
      <div className="flex flex-wrap justify-center gap-2">
        {profileMetadata.admin && (
          <Badge className="px-4 py-1 rounded-full border-amber-400 dark:border-amber-600 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
            Administrator
          </Badge>
        )}
        {profileMetadata.faqAuthor && (
          <Badge className="px-4 py-1 rounded-full border-emerald-400 dark:border-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200">
            FAQ Author
          </Badge>
        )}
        {profileMetadata.agencyName !== null && (
          <Badge
            className="px-4 py-1 rounded-full border-primary/50 bg-primary/10 text-primary cursor-pointer dark:bg-primary/30 dark:text-primary-foreground dark:border-primary/60"
            title={profileMetadata.agencyName ? `User is an agent of ${profileMetadata.agencyName}${profileMetadata.agencyCount > 1 ? ` + ${profileMetadata.agencyCount - 1} more` : ""}` : undefined}
            onClick={onAgencyClick}
          >
            Agency Rep
          </Badge>
        )}
        {display.banned && (
          <Badge className="px-4 py-1 rounded-full border-red-400 dark:border-red-600 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200">
            <Ban className="h-3 w-3 mr-1" /> Banned
          </Badge>
        )}
        {display.restricted && (
          <Badge className="px-4 py-1 rounded-full border-orange-400 dark:border-orange-600 bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200">
            <ShieldAlert className="h-3 w-3 mr-1" /> Restricted
          </Badge>
        )}
      </div>
    )}

    {/* Admin moderation actions */}
    {auth.admin && !isOwnProfile && profileMetadata && (
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onNavigateAdmin}
          className="text-xs border-primary/40 text-primary hover:bg-primary/10"
        >
          <ShieldCheck className="h-3 w-3 mr-1" /> Manage in Admin Panel
        </Button>
        {display.banned ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnban}
            className="text-xs border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
            disabled={auth.restricted}
          >
            Unban User
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onBan}
            className="text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
            disabled={auth.restricted}
          >
            <Ban className="h-3 w-3 mr-1" /> Ban User
          </Button>
        )}
        {display.restricted ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onUnrestrict}
            className="text-xs border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
            disabled={auth.restricted}
          >
            Unrestrict User
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onRestrict}
            className="text-xs border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/40"
            disabled={auth.restricted}
          >
            <ShieldAlert className="h-3 w-3 mr-1" /> Restrict User
          </Button>
        )}
      </div>
    )}

    {isLoadingWithInitialRender && (
      <div className="h-6 w-32 bg-muted/50 rounded-full animate-pulse" />
    )}

    {/* Deletion request banner (own profile) */}
    {isOwnProfile && myDeletionRequest && (
      <div className="mt-4 w-full max-w-md border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-left space-y-2">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          Your account is scheduled for deletion
        </div>
        <p className="text-xs text-red-600 dark:text-red-400">
          Will be automatically deleted on <span className="font-medium">{formatDate(myDeletionRequest.autoApproveBy)}</span>
          {myDeletionRequest.clearAccount && " — all account content will also be cleared."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancelDeletion}
          className="text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
        >
          Cancel Deletion Request
        </Button>
      </div>
    )}
  </div>
);
