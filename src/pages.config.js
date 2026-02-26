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
import ActiveTicket from './pages/ActiveTicket';
import AddUnit from './pages/AddUnit';
import CreateTicket from './pages/CreateTicket';
import Culinary from './pages/Culinary';
import CulinaryDetail from './pages/CulinaryDetail';
import DealsPromoDetail from './pages/DealsPromoDetail';
import EventDetail from './pages/EventDetail';
import Events from './pages/Events';
import EventsCalendar from './pages/EventsCalendar';
import Explore from './pages/Explore';
import ExploreDetail from './pages/ExploreDetail';
import ForgotPassword from './pages/ForgotPassword';
import HelpCenter from './pages/HelpCenter';
import Home from './pages/Home';
import MyClaims from './pages/MyClaims';
import MyUnit from './pages/MyUnit';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import PrivacySecurity from './pages/PrivacySecurity';
import Profile from './pages/Profile';
import PropertyDetail from './pages/PropertyDetail';
import PropertyListing from './pages/PropertyListing';
import Register from './pages/Register';
import RegistrationSuccess from './pages/RegistrationSuccess';
import RewardDetail from './pages/RewardDetail';
import RewardReceipt from './pages/RewardReceipt';
import Rewards from './pages/Rewards';
import ScanBill from './pages/ScanBill';
import Splash from './pages/Splash';
import TenantDetail from './pages/TenantDetail';
import TenantList from './pages/TenantList';
import TicketDetail from './pages/TicketDetail';
import TicketSubmitted from './pages/TicketSubmitted';
import Tickets from './pages/Tickets';
import Transport from './pages/Transport';
import TransportExploreMap from './pages/TransportExploreMap';
import TransportResult from './pages/TransportResult';
import TransportSearch from './pages/TransportSearch';
import TransportTicketDetail from './pages/TransportTicketDetail';
import TransportTicketDetails from './pages/TransportTicketDetails';
import UnitDetail from './pages/UnitDetail';
import UnitSubmitted from './pages/UnitSubmitted';
import Verification from './pages/Verification';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActiveTicket": ActiveTicket,
    "AddUnit": AddUnit,
    "CreateTicket": CreateTicket,
    "Culinary": Culinary,
    "CulinaryDetail": CulinaryDetail,
    "DealsPromoDetail": DealsPromoDetail,
    "EventDetail": EventDetail,
    "Events": Events,
    "EventsCalendar": EventsCalendar,
    "Explore": Explore,
    "ExploreDetail": ExploreDetail,
    "ForgotPassword": ForgotPassword,
    "HelpCenter": HelpCenter,
    "Home": Home,
    "MyClaims": MyClaims,
    "MyUnit": MyUnit,
    "News": News,
    "NewsDetail": NewsDetail,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "PrivacySecurity": PrivacySecurity,
    "Profile": Profile,
    "PropertyDetail": PropertyDetail,
    "PropertyListing": PropertyListing,
    "Register": Register,
    "RegistrationSuccess": RegistrationSuccess,
    "RewardDetail": RewardDetail,
    "RewardReceipt": RewardReceipt,
    "Rewards": Rewards,
    "ScanBill": ScanBill,
    "Splash": Splash,
    "TenantDetail": TenantDetail,
    "TenantList": TenantList,
    "TicketDetail": TicketDetail,
    "TicketSubmitted": TicketSubmitted,
    "Tickets": Tickets,
    "Transport": Transport,
    "TransportExploreMap": TransportExploreMap,
    "TransportResult": TransportResult,
    "TransportSearch": TransportSearch,
    "TransportTicketDetail": TransportTicketDetail,
    "TransportTicketDetails": TransportTicketDetails,
    "UnitDetail": UnitDetail,
    "UnitSubmitted": UnitSubmitted,
    "Verification": Verification,
}

export const pagesConfig = {
    mainPage: "Splash",
    Pages: PAGES,
    Layout: __Layout,
};