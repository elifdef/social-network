import { useContext } from "react";
import { useUserProfileLogic } from "../../hooks/useUserProfileLogic";
import { AuthContext } from "../../context/AuthContext";
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
                            loading={loading}
                            status={status}
                            isBlockedByMe={isBlockedByMe}
                            isBlockedByTarget={isBlockedByTarget}
                            onFriendAction={handleFriendshipAction}
                            onBlockAction={handleBlockAction}
                            isBanned={isBanned}
                        />
                    )}
                </div>

                <div className="socnet-right-col">
                    <ProfileHeader user={currentUser} />

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
        </div>
    );
}