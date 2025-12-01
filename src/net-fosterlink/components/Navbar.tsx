import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from "@/components/ui/navigation-menu";
import { ListItem } from "./ListItem";
import { Link } from "react-router";
import { useAuth } from "../backend/AuthContext";
import { Badge } from "@/components/ui/badge";
import type { UserModel } from "../backend/models/UserModel";

export function Navbar({userInfo} : {userInfo: UserModel | undefined}) {

  const auth = useAuth()
    return (<NavigationMenu>
        <NavigationMenuList className='flex-wrap'>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              Agencies
            </NavigationMenuTrigger>
            <NavigationMenuContent className="bg-white">
              <ul className='grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols[.75fr_1fr]'>
                <ListItem href="/#" title="Example 1 (agencies)">
                  This is page 1 where you can do thing 1
                </ListItem>
                <ListItem href="/#" title="Example 2 (agencies)">
                  This is page 2 where you can do thing 2
                </ListItem>                
                <ListItem href="/#" title="Example 3 (agencies)">
                  This is page 3 where you can do thing 3
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              FAQ
            </NavigationMenuTrigger>
            <NavigationMenuContent className="bg-white">
              <ul className='grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols[.75fr_1fr]'>
                <ListItem href="/faq" title="View all faqs">
                  View a list of all FAQs, including summaries. Supports sharing!
                </ListItem>
                <ListItem href="/#" title="Example 2 (FAQ)">
                  This is page 2 where you can do thing 2
                </ListItem>                
                <ListItem href="/#" title="Example 3 (FAQ)">
                  This is page 3 where you can do thing 3
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
                    <NavigationMenuItem>
            <NavigationMenuTrigger>
              Forum
            </NavigationMenuTrigger>
            <NavigationMenuContent className="bg-white">
              <ul className='grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols[.75fr_1fr]'>
                <ListItem href="/threads" title="View threads">
                  View threads made by other users. Includes searching and filtering!
                </ListItem>
                <ListItem href="/#" title="Example 2 (forum)">
                  This is page 2 where you can do thing 2
                </ListItem>                
                <ListItem href="/#" title="Example 3 (forum)">
                  This is page 3 where you can do thing 3
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
                    <NavigationMenuItem>
            <NavigationMenuTrigger>
              My Account
            </NavigationMenuTrigger>
            <NavigationMenuContent className="bg-white">
              <ul className='grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols[.75fr_1fr]'>
                {
                  auth.isLoggedIn() ? <>
                    <a onClick={auth.logout}>Logout</a>
                  </> : <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                  </>
                }
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <Badge variant="outline" style={{ visibility: (userInfo && auth.isLoggedIn()) ? "visible" : "hidden"}}>Logged in as {userInfo?.username}</Badge>
      </NavigationMenu>)
}