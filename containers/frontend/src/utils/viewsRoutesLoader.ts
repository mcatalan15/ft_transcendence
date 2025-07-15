import { showLanding } from '../views/landing';
import { showHome } from '../views/home';
import { showPong } from '../views/pong';
import { showSignIn } from '../views/signin';
import { showSignUp } from '../views/signup';
import { showProfile } from '../views/profile';
import { showBlockchain } from '../views/blockchain'; // si sigue en uso
import { showFriends } from '../views/friends';
import { showChat } from '../views/chat';
import { showAuth } from '../views/auth';
import { showSettings } from '../views/settings';
import { showHistory } from '../views/history';
import { show404 } from '../views/404';

const viewsRoutes = {
	showLanding,
	showHome,
	showPong,
	showSignIn,
	showSignUp,
	showProfile,
	showBlockchain,
	showFriends,
	showChat,
	showAuth,
	showSettings,
	showHistory,
	show404,
};

export default viewsRoutes;