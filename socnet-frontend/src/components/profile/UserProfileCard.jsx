import { useUserProfileLogic } from "../../hooks/useUserProfileLogic";
import ProfileAvatar from "./ProfileAvatar";
import ProfileActions from "./ProfileActions";
import ProfileHeader from "./ProfileHeader";
import ProfileStatus from "./ProfileStatus";
import ProfileInfo from "./ProfileInfo";

export default function UserProfileCard({ currentUser, isPreview = false }) {
    if (!currentUser) 
        return null;

    const {
        status, loading, sameUser,
        isBlockedByMe, isBlockedByTarget,
        displayAvatar, displayBio, displayBirth, displayCountry, displayGender,
        handleFriendshipAction, handleBlockAction
    } = useUserProfileLogic(currentUser, isPreview);

    return (
        <div className="vk-card-wrapper">
            <div className="vk-container">
                <div className="vk-left-col">
                    <ProfileAvatar
                        user={{ ...currentUser, avatar: displayAvatar }}
                        isPreview={isPreview}
                        isBlocked={isBlockedByTarget}
                    />

                    {!isPreview && (
                        <ProfileActions
                            sameUser={sameUser}
                            loading={loading}
                            status={status}
                            isBlockedByMe={isBlockedByMe}
                            isBlockedByTarget={isBlockedByTarget}
                            onFriendAction={handleFriendshipAction}
                            onBlockAction={handleBlockAction}
                        />
                    )}
                </div>

                <div className="vk-right-col">
                    <ProfileHeader user={currentUser} />

                    <ProfileStatus bio={displayBio} />

                    {(isPreview || !isBlockedByTarget) && (
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