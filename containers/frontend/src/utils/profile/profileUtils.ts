import { navigate } from "../router";
import { getApiUrl } from "../../config/api";
import { MessageManager } from '../../utils/messageManager';
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
            MessageManager.showSuccess(i18n.t('friendAddedMsg', { ns: 'friends' }));
            if (onSuccess) {
                onSuccess();
            }
			return true;
        } else {
            //alert(i18n.t);
			return false;
		}
    } catch (error) {
        MessageManager.showError(i18n.t('addFailed', { ns: 'friends' }));
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
            MessageManager.showSuccess(i18n.t('friendRemovedMsg', { username, ns: 'friends' }));
            if (onSuccess) {
                onSuccess();
            }
			return true;
        } else {
            MessageManager.showError(i18n.t('removalFailedMsg', { username, ns: 'friends' }));
			return false;
        }
    } catch (error) {
        MessageManager.showError(i18n.t('removalFailed', { ns: 'friends' }));
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
        MessageManager.showError(i18n.t('error.nicknameEmpty', { ns: 'profile' }));
        return;
    }
    if (newNick === sessionStorage.getItem('username')) {
        MessageManager.showError(i18n.t('error.nicknameSame', { ns: 'profile' }));
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
            MessageManager.showSuccess(i18n.t('nicknameChangeSuccess', { ns: 'profile' }));
            navigate('/settings');
            return;
        } else {
            if (result.message && result.message.includes('already exists')) {
                MessageManager.showError(i18n.t('error.nicknameExists', { ns: 'profile' }));
            } else {
                MessageManager.showError(i18n.t('error.nicknameChangeFailed', { ns: 'profile' }));
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
			MessageManager.showError(i18n.t('error.passwordSame', { ns: 'profile' }));
			return;
		}

		const result = await response.json();
		
		if (result.success) {
			MessageManager.showSuccess('Password changed successfully!');
			navigate('/settings');
            return;
		} else {
			MessageManager.showError(i18n.t('error.passwordChangeFailed', { ns: 'profile' }) + result.message);
		}

	} catch (error) {
		console.error('Error changing password:', error);
		MessageManager.showError(i18n.t('error.networkError', { ns: 'profile' }));
	}
}