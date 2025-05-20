import { useState } from "react";
import { Title, Description } from "@/components/Title";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersList from "@/components/Request/UserList";
import CategoryList from "@/components/Request/CategoryList";

const Requests = () => {
  const [tab, setTab] = useState("users");

  return (
    <div className="no-scrollbar flex h-full flex-col gap-7 overflow-y-auto">
      <div>
        <Title>Requests</Title>
        <Description>Manage your organisation&apos;s community.</Description>
      </div>
      <div>
        <Tabs
          className="w-full"
          onValueChange={(value) => setTab(value)}
          defaultValue={tab}
        >
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {tab === "users" && <UsersList />}
      {tab === "categories" && <CategoryList />}
    </div>
  );
};

export default Requests;
