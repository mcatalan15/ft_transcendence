import { navigate } from '../../utils/router';
import i18n from '../../i18n';
import { getApiUrl } from '../../config/api';
import { MessageManager } from '../../utils/messageManager';

interface ProfileData {
  username: string;
  userId: string;
  stats: {
    totalGames: number;
    totalTournaments: number;
    wins: number;
    losses: number;
  };
  isFriend?: boolean;
}

export class ProfileContentRenderer {
  private container: HTMLElement;
  private username?: string;

  constructor(container: HTMLElement, username?: string) {
    this.container = container;
    this.username = username;
  }

  async render(): Promise<HTMLElement> {
    const mainContent = document.createElement('div');
    mainContent.className = 'w-full h-full flex flex-row';

    try {
	  console.log()
      const data = await this.fetchProfileData();
      const statsColumn = this.createStatsColumn(data);
      const buttonsColumn = this.createButtonsColumn(data);

      mainContent.appendChild(statsColumn);
      mainContent.appendChild(buttonsColumn);
    } catch (error) {
      console.error('Error loading profile:', error);
      MessageManager.showError('Error al cargar el perfil');
    }

    return mainContent;
  }


  private async fetchProfileData(): Promise<ProfileData> {
	  console.log('Render token: ', sessionStorage.getItem('token'));
    const apiEndpoint = this.username ? 
      getApiUrl(`/profile/${this.username}`) : 
      getApiUrl('/profile');
	
	const token = sessionStorage.getItem('token');
    
	//log of the token
	console.log('Token:', token);
	const response = await fetch(apiEndpoint, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
		'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private createStatsColumn(data: ProfileData): HTMLElement {
    const column = document.createElement('div');
    column.className = 'w-1/2 flex flex-col items-center justify-center gap-5 p-4';

    const statsContainer = document.createElement('div');
    statsContainer.className = 'w-full flex flex-col';
    Object.assign(statsContainer.style, {
      backgroundColor: '#171717',
      padding: '12px',
      marginBottom: '20px'
    });

    const statsHeader = document.createElement('div');
    Object.assign(statsHeader.style, {
      backgroundColor: '#171717',
      padding: '8px 12px',
      marginBottom: '20px',
      width: '100%',
      textAlign: 'center'
    });

    const headerText = document.createElement('span');
    Object.assign(headerText.style, {
      color: '#FFFBEB',
      fontFamily: 'anatol-mn',
      fontSize: '40px',
      fontWeight: 'bold',
      letterSpacing: '2px'
    });
    headerText.textContent = i18n.t('playerStats', { ns: 'profile' });
    statsHeader.appendChild(headerText);
    statsContainer.appendChild(statsHeader);

    const stats = [
      { label: i18n.t('victories', { ns: 'profile' }), value: data.stats.wins },
      { label: i18n.t('losses', { ns: 'profile' }), value: data.stats.losses },
      { label: i18n.t('matchesPlayed', { ns: 'profile' }), value: data.stats.totalGames },
      { label: i18n.t('tournamentsPlayed', { ns: 'profile' }), value: data.stats.totalTournaments },
      { 
        label: i18n.t('winRate', { ns: 'profile' }), 
        value: `${((data.stats.wins / (data.stats.totalGames || 1)) * 100).toFixed(1)}%` 
      }
    ];

    stats.forEach(stat => {
      const statRow = document.createElement('div');
      Object.assign(statRow.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 251, 235, 0.2)',
        padding: '8px 0',
        marginBottom: '4px'
      });
      
      const labelSpan = document.createElement('span');
      Object.assign(labelSpan.style, {
        color: '#FFFBEB',
        fontFamily: '"Roboto Mono", monospace',
        fontSize: '20px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      });
      labelSpan.textContent = stat.label.toUpperCase();

      const valueSpan = document.createElement('span');
      Object.assign(valueSpan.style, {
        color: '#FFFBEB',
        fontFamily: '"Roboto Mono", monospace',
        fontSize: '20px',
        letterSpacing: '2px',
        textShadow: '0 0 8px rgba(255, 251, 235, 0.3)'
      });
      valueSpan.textContent = stat.value.toString();
      
      statRow.appendChild(labelSpan);
      statRow.appendChild(valueSpan);
      statsContainer.appendChild(statRow);
    });

    column.appendChild(statsContainer);
    return column;
  }

  private createButtonsColumn(data: ProfileData): HTMLElement {
    const column = document.createElement('div');
    column.className = 'w-1/2 flex flex-col items-center justify-center gap-3 p-4';

    const buttons = this.getButtonsConfig(data);
    buttons.forEach(btn => {
      const button = this.createButton(btn.color, btn.label, btn.action);
      column.appendChild(button);
    });

    return column;
  }

  private getButtonsConfig(data: ProfileData) {
    const isOwnProfile = !this.username || this.username === sessionStorage.getItem('username');
    
    if (isOwnProfile) {
      return [
        {
          label: i18n.t('matches', { ns: 'profile' }),
          action: () => navigate(`/history/${data.username}`),
          color: 'amber'
        },
        {
          label: i18n.t('friends', { ns: 'profile' }),
          action: () => navigate('/friends'),
          color: 'amber'
        },
        {
          label: '',
          action: undefined,
          color: 'black'
        },
        {
          label: i18n.t('settings', { ns: 'profile' }),
          action: () => navigate('/settings'),
          color: 'amber'
        },
      ];
    }

    return [
      {
        label: i18n.t('matches', { ns: 'profile' }),
        action: () => navigate(`/history/${data.username}`),
        color: 'amber'
      },
      {
        label: i18n.t('chat', { ns: 'profile' }),
        action: () => navigate('/chat'),
        color: 'amber'
      },
      {
        label: '',
        action: undefined,
        color: 'black'
      },
      {
        label: i18n.t(data.isFriend ? 'removeFriend' : 'addFriend', { ns: 'profile' }),
        action: () => this.handleFriendAction(data),
        color: data.isFriend ? 'red' : 'lime'
      }
    ];
  }

  private createButton(color: string, text: string, action: () => void | undefined): HTMLElement {
    if (color === 'black') {
      const spacer = document.createElement('div');
      spacer.className = 'w-full max-w-xs';
      spacer.style.height = '20px';
      return spacer;
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.className = 'w-full max-w-xs text-base md:text-xl';

    let buttonColor = '#FFFBEB';

    const colorMap: { [key: string]: string } = {
      'white': '#FFFFFF',
      'lime': '#84cc16',
      'amber': '#FFFBEB',
      'red': '#ef4444',
      'black': '#171717'
    };

    if (text.toLowerCase().includes('remove friend')) {
      buttonColor = colorMap.red;
    } else if (text.toLowerCase().includes('add friend')) {
      buttonColor = colorMap.lime;
    } else if (color in colorMap) {
      buttonColor = colorMap[color];
    }

    Object.assign(btn.style, {
        backgroundColor: 'transparent',
        border: `2px solid ${buttonColor}`,
        color: buttonColor,
        fontFamily: '"Roboto Mono", monospace',
        fontWeight: 'bold',
        fontSize: '14px',
        textTransform: 'uppercase',
        padding: '12px 24px',
        borderRadius: '0px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        width: '100%',
        maxWidth: '18rem',
        margin: '2px 0'
    });

    btn.addEventListener('mouseenter', () => {
        btn.style.backgroundColor = buttonColor;
        btn.style.color = '#171717';
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = buttonColor;
    });

    btn.onclick = action;
    return btn;
  }

//   private async handleFriendAction(data: ProfileData): Promise<void> {
//     try {
// 		const token = sessionStorage('token');
//       const endpoint = data.isFriend ? '/friends/remove' : '/friends/add';
//       const method = data.isFriend ? 'DELETE' : 'POST';
      
//       const response = await fetch(getApiUrl(endpoint), {
//         method: method,
//         credentials: 'include',
//         headers: {
//           'Content-Type': 'application/json',
// 			'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({ username: this.username })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update friend status');
//       }

//       data.isFriend = !data.isFriend;
      
//       const column = this.createButtonsColumn(data);
//       const oldColumn = this.container.querySelector('div[class*="w-1/2"]:last-of-type');
//       if (oldColumn && oldColumn.parentNode) {
//         oldColumn.parentNode.replaceChild(column, oldColumn);
//       }

//       if (data.isFriend) {
//         MessageManager.showSuccess(i18n.t('friendAdded', { ns: 'profile' }));
//       } else {
//         MessageManager.showError(i18n.t('friendRemoved', { ns: 'profile' }));
//       }

//     } catch (error) {
//       console.error('Error updating friend status:', error);
//       MessageManager.showError(i18n.t('friendshipStatusError', { ns: 'profile' }));
//     }
//   }
// }

	private async handleFriendAction(data: ProfileData): Promise<void> {
		try {
			const token = sessionStorage.getItem('token');
			console.log('Friend action token:', token);
			if (!token) {
				console.error('No token found in sessionStorage');
				navigate('/signin');
				throw new Error('No token found');
			}
			const endpoint = data.isFriend ? '/friends/remove' : '/friends/add';
			const method = data.isFriend ? 'DELETE' : 'POST';
			console.log(`Sending ${method} to ${getApiUrl(endpoint)} with username: ${this.username}`);
			const response = await fetch(getApiUrl(endpoint), {
				method: method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({ username: this.username }),
			});
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error('Friend action error response:', errorData);
				throw new Error(`Failed to update friend status: ${errorData.message || 'Unknown error'}`);
			}
			data.isFriend = !data.isFriend;
			const column = this.createButtonsColumn(data);
			const oldColumn = this.container.querySelector('div[class*="w-1/2"]:last-of-type');
			if (oldColumn && oldColumn.parentNode) {
				oldColumn.parentNode.replaceChild(column, oldColumn);
			}
			if (data.isFriend) {
				MessageManager.showSuccess(i18n.t('friendAdded', { ns: 'profile' }));
			} else {
				MessageManager.showError(i18n.t('friendRemoved', { ns: 'profile' }));
			}
		} catch (error) {
			console.error('Error updating friend status:', error);
			MessageManager.showError(i18n.t('friendshipStatusError', { ns: 'profile' }));
		}
	}
}