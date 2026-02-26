/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AddUnit from './pages/AddUnit';
import CreateTicket from './pages/CreateTicket';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import MyUnit from './pages/MyUnit';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import Register from './pages/Register';
import RegistrationSuccess from './pages/RegistrationSuccess';
import Splash from './pages/Splash';
import TicketDetail from './pages/TicketDetail';
import TicketSubmitted from './pages/TicketSubmitted';
import Tickets from './pages/Tickets';
import UnitDetail from './pages/UnitDetail';
import UnitSubmitted from './pages/UnitSubmitted';
import Verification from './pages/Verification';
import PropertyListing from './pages/PropertyListing';
import PropertyDetail from './pages/PropertyDetail';
import Explore from './pages/Explore';
import ExploreDetail from './pages/ExploreDetail';
import TenantList from './pages/TenantList';
import TenantDetail from './pages/TenantDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import EventsCalendar from './pages/EventsCalendar';
import HelpCenter from './pages/HelpCenter';
import PrivacySecurity from './pages/PrivacySecurity';
import Rewards from './pages/Rewards';
import RewardDetail from './pages/RewardDetail';
import RewardReceipt from './pages/RewardReceipt';
import MyClaims from './pages/MyClaims';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddUnit": AddUnit,
    "CreateTicket": CreateTicket,
    "ForgotPassword": ForgotPassword,
    "Home": Home,
    "MyUnit": MyUnit,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "Profile": Profile,
    "Register": Register,
    "RegistrationSuccess": RegistrationSuccess,
    "Splash": Splash,
    "TicketDetail": TicketDetail,
    "TicketSubmitted": TicketSubmitted,
    "Tickets": Tickets,
    "UnitDetail": UnitDetail,
    "UnitSubmitted": UnitSubmitted,
    "Verification": Verification,
    "PropertyListing": PropertyListing,
    "PropertyDetail": PropertyDetail,
    "Explore": Explore,
    "ExploreDetail": ExploreDetail,
    "TenantList": TenantList,
    "TenantDetail": TenantDetail,
    "Events": Events,
    "EventDetail": EventDetail,
    "EventsCalendar": EventsCalendar,
    "HelpCenter": HelpCenter,
    "PrivacySecurity": PrivacySecurity,
    "Rewards": Rewards,
    "RewardDetail": RewardDetail,
    "RewardReceipt": RewardReceipt,
    "MyClaims": MyClaims,
}

export const pagesConfig = {
    mainPage: "Splash",
    Pages: PAGES,
    Layout: __Layout,
};