import { useState, useContext } from "react";
import { useUserProfileLogic } from "../../hooks/useUserProfileLogic";
import { AuthContext } from "../../context/AuthContext";
import ReportModal from "../common/ReportModal";
import { userRole } from "../../config";
import ProfileAvatar from "./ProfileAvatar";
import ProfileActions from "./ProfileActions";
import ProfileHeader from "./ProfileHeader";
import ProfileStatus from "./ProfileStatus";
import ProfileInfo from "./ProfileInfo";
import StaffBanner from "./StaffBanner";

export default function UserProfileCard({ currentUser, isPreview = false }) {
    const { user: authUser } = useContext(AuthContext);
    if (!currentUser)
        return null;

    const {
        status, loading, sameUser,
        isBanned, isBlockedByMe, isBlockedByTarget,
        displayAvatar, displayBio, displayBirth, displayCountry, displayGender,
        handleFriendshipAction, handleBlockAction
    } = useUserProfileLogic(currentUser, isPreview);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const isStaff = currentUser.role >= userRole.Support;

    return (
        <div className="socnet-card-wrapper">
            {!isPreview && isStaff && !isBanned && <StaffBanner userRole={currentUser.role} />}
            <div className="socnet-container">
                <div className="socnet-left-col">
                    <ProfileAvatar
                        user={{ ...currentUser, avatar: displayAvatar }}
                        isPreview={isPreview}
                        isBlocked={isBlockedByTarget || isBanned}
                    />

                    {!isPreview && authUser && (!isPreview || sameUser) && (
                        <ProfileActions
                            sameUser={sameUser}
                            userId={currentUser.id}
                            loading={loading}
                            status={status}
                            isBlockedByMe={isBlockedByMe}
                            isBlockedByTarget={isBlockedByTarget}
                            onFriendAction={handleFriendshipAction}
                            onBlockAction={handleBlockAction}
                            isBanned={isBanned}
                            onReportAction={() => setIsReportModalOpen(true)}
                        />
                    )}
                </div>

                <div className="socnet-right-col">
                    <ProfileHeader user={currentUser} isPreview={isPreview} />

                    <ProfileStatus bio={displayBio} />

                    {(isPreview || (!isBlockedByTarget && !isBanned)) && (
                        <ProfileInfo
                            user={currentUser}
                            displayBirth={displayBirth}
                            displayCountry={displayCountry}
                            displayGender={displayGender}
                            showFriendsBlock={!isPreview}
                        />
                    )}
                </div>
            </div>
            {currentUser && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    targetType="user"
                    targetId={currentUser.id}
                />
            )}
        </div>
    );
}