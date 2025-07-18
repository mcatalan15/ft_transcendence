import { navigate } from "../router";
import { getApiUrl } from "../../config/api";
import i18n from "../../i18n";

export async function addFriend(username: string, onSuccess?: () => void): Promise<boolean> {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.error('No token found in sessionStorage');
            alert('Authentication required');
            navigate('/signin');
            return false;
        }

        const response = await fetch(getApiUrl('/friends/add'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ username })
        });

        const result = await response.json();
        if (result.success) {
            alert(i18n.t('friendAddedMsg', { ns: 'friends' }));
            if (onSuccess) {
                onSuccess();
            }
			return true;
        } else {
            alert(i18n.t);
			return false;
		}
    } catch (error) {
        alert(i18n.t('addFailed', { ns: 'friends' }));
		return false;
    }
}

export async function removeFriend(username: string, onSuccess?: () => void): Promise<boolean> {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) {
            console.error('No token found in sessionStorage');
            alert('Authentication required');
            navigate('/signin');
            return false;
        }

        const response = await fetch(getApiUrl('/friends/remove'), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ username })
        });

        const result = await response.json();
        if (result.success) {
            alert(i18n.t('friendRemovedMsg', { username, ns: 'friends' }));
            if (onSuccess) {
                onSuccess();
            }
			return true;
        } else {
            alert(i18n.t('removalFailedMsg', { username, ns: 'friends' }));
			return false;
        }
    } catch (error) {
        alert(i18n.t('removalFailed', { ns: 'friends' }));
		return false;
    }
}

export async function statusFriend(username: string): Promise<boolean> {
	try {
		const token = sessionStorage.getItem('token');
		if (!token) {
			console.error('No token found in sessionStorage');
			navigate('/signin');
			return false;
		}

		const response = await fetch(getApiUrl(`/friends/status/${username}`), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
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
    if (newNick === sessionStorage.getItem('username')) {
        alert(i18n.t('error.nicknameSame', { ns: 'profile' }));
        return;
    }

	try {
		const token = sessionStorage.getItem('token');
		if (!token) {
			console.error('No token found in sessionStorage');
			alert('Authentication required');
			navigate('/signin');
			return;
		}

		const response = await fetch(getApiUrl('/profile/nickname'), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
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
                alert(i18n.t('error.nicknameChangeFailed', { ns: 'profile' }));
            }
        }

    } catch (error) {
        console.error('Error changing nickname:', error);
        alert(i18n.t('error.networkError', { ns: 'profile' }));
    }
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
	try {
		const token = sessionStorage.getItem('token');
		if (!token) {
			console.error('No token found in sessionStorage');
			alert('Authentication required');
			navigate('/signin');
			return;
		}

		const response = await fetch(getApiUrl('/profile/password'), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
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
			alert('Password changed successfully!');
			navigate('/settings');
            return;
		} else {
			alert(i18n.t('error.passwordChangeFailed', { ns: 'profile' }) + result.message);
		}

	} catch (error) {
		console.error('Error changing password:', error);
		alert(i18n.t('error.networkError', { ns: 'profile' }));
	}
}