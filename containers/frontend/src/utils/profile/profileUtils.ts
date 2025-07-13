import { navigate } from "../router";
import { getApiUrl } from "../../config/api";
import i18n from "../../i18n";

export async function addFriend(username: string, onSuccess?: () => void): Promise<boolean> {
    try {
        const response = await fetch(getApiUrl('/friends/add'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username })
        });

        const result = await response.json();
        if (result.success) {
            alert(`${username} added as friend!`);
            if (onSuccess) {
                onSuccess();
            }
			return true;
        } else {
            alert(i18n.t('addFailedMsg' + result.message, { ns: 'friends' }));
			return false;
		}
    } catch (error) {
        alert(i18n.t('addFailed', { ns: 'friends' }));
		return false;
    }
}

export async function removeFriend(username: string, onSuccess?: () => void): Promise<boolean> {
    try {
        const response = await fetch(getApiUrl('/friends/remove'), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username })
        });

        const result = await response.json();
        if (result.success) {
            alert(i18n.t('friendRemoved' + username, { ns: 'friends' })); ;
            if (onSuccess) {
                onSuccess();
            }
			return true;
        } else {
            alert(i18n.t('removalFailedMsg' + result.message, { ns: 'friends' }));
			return false;
        }
    } catch (error) {
        alert(i18n.t('removalFailed', { ns: 'friends' }));
		return false;
    }
}

export async function statusFriend(username: string): Promise<boolean> {
	try {
		const response = await fetch(getApiUrl(`/friends/status/${username}`), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		});

		const result = await response.json();
		if (result.success && result.isFriend) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		console.error('Error checking friendship status:', error);
		return false;
	}
}

export async function changeNickname(newNick: string): Promise<void> {

    if (!newNick || newNick.trim() === '') {
        alert(i18n.t('error.nicknameEmpty', { ns: 'profile' }));
        return;
    }
    else if (newNick === sessionStorage.getItem('username')) {
        alert(i18n.t('error.nicknameSame', { ns: 'profile' }));
        return;
    }

	try {
		const response = await fetch(getApiUrl('/profile/nickname'), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ nickname: newNick })
		});

        const result = await response.json();
        
        if (result.success) {
            sessionStorage.setItem('username', newNick);
            alert(i18n.t('nicknameChangeSuccess', { ns: 'profile' }));
            navigate('/settings');
            return;
        } else {
            if (result.message && result.message.includes('already exists')) {
                alert(i18n.t('error.nicknameExists', { ns: 'profile' }));
            } else {
                alert(i18n.t('error.changeFailedMsg' + (result.message || 'Unknown error'), { ns: 'profile' }));
            }
        }

    } catch (error) {
        console.error('Error changing nickname:', error);
        alert(i18n.t('error.networkError', { ns: 'profile' }));
    }
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
	try {
		const response = await fetch(getApiUrl('/profile/password'), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ oldPassword, newPassword })
		});

		if (oldPassword === newPassword) {
			alert(i18n.t('error.passwordSame', { ns: 'profile' }));
			return;
		}

		const result = await response.json();
		
		if (result.success) {
			alert(i18n.t('passwordChangeSuccess', { ns: 'profile' }));
			navigate('/settings');
            return;
		} else {
			alert(i18n.t('error.changeFailedMsg' + (result.message || 'Unknown error'), { ns: 'profile' }));
		}

	} catch (error) {
		console.error('Error changing password:', error);
		alert(i18n.t('error.networkError', { ns: 'profile' }));
	}
}