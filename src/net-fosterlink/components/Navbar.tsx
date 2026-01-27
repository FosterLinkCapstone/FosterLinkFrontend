
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { ListItem } from "./ListItem";
import { Link } from "react-router";
import { useAuth } from "../backend/AuthContext";
import { Badge } from "@/components/ui/badge";
import type { UserModel } from "../backend/models/UserModel";
import { AgentOnlyBadge } from "./AgentOnlyBadge";
import { AdminOnlyBadge } from "./AdminOnlyBadge";
import { FaqAuthorOnlyBadge } from "./FaqAuthorOnlyBadge";

export const Navbar = ({ userInfo }: { userInfo: UserModel | undefined }) => {
  const auth = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b w-full border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            FosterLink
          </Link>
          
          <div className="flex items-center gap-6">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-6">
                <Link className="hover:text-blue-600 transition-colors bg-transparent text-black text-semibold" to="/">Home</Link>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-600 hover:text-blue-600 transition-colors bg-transparent">
                    Forum
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white text-black">
                    <ul className="grid gap-2 p-4 md:w-[400px] lg:w-[500px]">
                      <ListItem href="/threads" title="View threads">
                        View threads made by other users. Includes searching and filtering!
                      </ListItem>
                      {auth.isLoggedIn() && (
                        <ListItem href="/threads?creating=true" title="Create a new thread">
                          Create a new thread. Create a title and some content!
                        </ListItem>
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-600 hover:text-blue-600 transition-colors bg-transparent">
                    FAQ
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white text-black">
                    <ul className="grid gap-2 p-4 md:w-[400px] lg:w-[500px]">
                      <ListItem href="/faq" title="View all FAQs">
                        View a list of all FAQs, including summaries. Supports sharing!
                      </ListItem>
                      {auth.admin && (
                        <ListItem href="/faq/pending" title="Pending FAQs">
                          <div className="flex flex-col items-center">
                            <AdminOnlyBadge /> 
                            <span>Review and approve or deny pending FAQ responses</span>
                          </div>

                        </ListItem>
                      )}
                      {(auth.faqAuthor || auth.admin) && (
                        <ListItem href="/faq?creating=true" title="Create FAQ Response">
                            <div className="flex flex-col items-center">
                              <FaqAuthorOnlyBadge />
                              <span>Create a new FAQ response, based on an original idea or a suggestion!</span>
                            </div>


                        </ListItem>
                      )}
                      {auth.isLoggedIn() && (
                        <ListItem href="/faq?suggesting=true" title="Suggest FAQ response">
                          Suggest a new FAQ response! Your suggestion will be used as the title.
                        </ListItem>
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-600 hover:text-blue-600 transition-colors bg-transparent">
                    Agencies
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white text-black">
                    <ul className="grid gap-2 p-4 md:w-[400px] lg:w-[500px]">
                      <ListItem href="/agencies" title="View All Agencies">
                        View a list of every agency, their locations, mission statements, and agent information.
                      </ListItem>
                      {auth.admin && (
                        <ListItem href="/agencies/pending" title="Pending agencies">
                            <div className="flex flex-col items-center">
                              <AdminOnlyBadge /> 
                              <span>Review, approve, or deny pending agency requests</span>
                            </div>

                        </ListItem>
                      )}
                      {(auth.admin || auth.agent) && (
                        <ListItem href="/agencies?creating=true" title="Create a new agency">
                            <div className="flex flex-col items-center">
                              <AgentOnlyBadge />
                              <span>Create a new agency, which will be listed on the agencies page!</span>
                            </div>
                        </ListItem>
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-600 hover:text-blue-600 transition-colors bg-transparent">
                    My Account
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-white text-black">
                    <ul className="grid gap-2 p-4 md:w-[400px] lg:w-[500px]">
                      {auth.isLoggedIn() ? (
                        <li className="list-none">
                          {userInfo && (
                            <ListItem href={`/users/${userInfo.id}`} title="My Profile">
                              View your public profile and posts
                            </ListItem>
                          )}
                          <a
                            onClick={auth.logout}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer"
                          >
                            <div className="text-sm font-medium leading-none">Logout</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Sign out of your account
                            </p>
                          </a>
                        </li>
                      ) : (
                        <>
                          <ListItem href={`/login?currentPage=${window.location.pathname}`} title="Login">
                            Sign in to your account
                          </ListItem>
                          <ListItem href="/register" title="Register">
                            Create a new account
                          </ListItem>
                        </>
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {userInfo && auth.isLoggedIn() && (
              <Badge variant="outline" className="ml-4">
                Logged in as {userInfo.username}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}