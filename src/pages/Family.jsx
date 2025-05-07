import { useState } from "react";
import NewFamilyForm from "@/components/Family/NewFamilyForm";
import { Title } from "@/components/Title";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThreeDotsIcon } from "@/assets/icons/icons";

import { useFamilyData } from "@/hooks/useFamilyData";
import { useDeleteChild } from "@/hooks/useFamily";
import EditChild from "@/components/Family/EditChild";
import EditParent from "@/components/Family/EditParent";
import NewCoParent from "@/components/Family/NewCoParent";
import { useUser } from "@/context/useUser";
import DeleteParent from "@/components/Family/DeleteParent";
import InviteFamily from "@/components/Family/InviteFamily";

const Family = () => {
  const [editParentForm, setEditParentForm] = useState(null);
  const [deleteParentForm, setDeleteParentForm] = useState(null);

  const userData = useUser();
  const userRole = userData?.userData?.role;
  const userId = userData?.userData?.id;

  const { parentData, childData, isLoading, error } = useFamilyData();
  const { mutateAsync: deleteChild } = useDeleteChild();

  // Handle child deletion
  const handleDeleteChild = async (childId) => {
    await deleteChild(childId);
  };

  // Show Edit Form
  const handleOpenDialog = (parentId) => {
    setEditParentForm(parentId);
  };

  // Show Delete form
  const showDeleteParentForm = (parentId) => {
    setDeleteParentForm(parentId);
  };

  // Close the form
  const handleCloseDialog = () => {
    setEditParentForm(null);
    setDeleteParentForm(null);
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <Title>Family information</Title>
      {/* Hide the New family form if the user is coparent */}
      {userRole !== "coparent" && (
        <div className="mt-5 flex gap-2">
          <NewFamilyForm />
          <InviteFamily />
        </div>
      )}

      {/* Family Members */}
      <div className="flex flex-col justify-center gap-2 lg:flex-row">
        <div className="no-scrollbar h-96 grow-[3] overflow-scroll rounded-xl border border-primary p-5 lg:h-auto">
          <Label className="text-primary-text">Parent(s)/Guardian(s)</Label>
          <Table>
            <TableHeader className="rounded-xl bg-primary">
              <TableRow>
                <TableHead className="rounded-l-lg text-center">Name</TableHead>
                <TableHead className="text-center">Contact</TableHead>
                {userRole !== "coparent" && (
                  <TableHead className="rounded-r-lg text-center">
                    Action
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : parentData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No data available.
                  </TableCell>
                </TableRow>
              ) : (
                parentData?.flatMap((parent) => (
                  <TableRow key={parent.id}>
                    <TableCell className="text-center">
                      {`${parent.first_name} ${parent.last_name}`}
                      {parent.parishioner_id === userId && " (You)"}
                    </TableCell>
                    <TableCell className="text-center">
                      {parent.contact_number}
                    </TableCell>
                    {userRole !== "coparent" &&
                      parent.parishioner_id !== userId && (
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <ThreeDotsIcon />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onSelect={() => handleOpenDialog(parent.id)}
                                disabled={parent.parishioner_id !== null}
                              >
                                Set up Parent/Guardian Account
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <EditParent
                                  parentId={parent.id}
                                  parentFirstName={parent.first_name}
                                  parentLastName={parent.last_name}
                                  parentContactNumber={parent.contact_number}
                                  parentUserId={parent.parishioner_id}
                                />
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => showDeleteParentForm(parent.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {/* Show Edit Parent Form */}
                          {editParentForm === parent.id && (
                            <NewCoParent
                              parentId={parent.id}
                              parentFirstName={parent.first_name}
                              parentLastName={parent.last_name}
                              parentContactNumber={parent.contact_number}
                              openModal={true}
                              onClose={handleCloseDialog}
                            />
                          )}
                          {/* Show Delete Parent */}
                          {deleteParentForm === parent.id && (
                            <DeleteParent
                              parentId={parent.id}
                              userId={parent.parishioner_id}
                              openModal={true}
                              onClose={handleCloseDialog}
                            />
                          )}
                        </TableCell>
                      )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="no-scrollbar h-96 grow-[2] overflow-scroll rounded-xl border-2 border-primary p-5 lg:h-auto">
          <Label className="text-primary-text">Children</Label>
          <Table>
            <TableHeader className="bg-primary">
              <TableRow className="text-center">
                <TableHead className="rounded-l-lg text-center">Name</TableHead>
                {userRole !== "coparent" && (
                  <TableHead className="rounded-r-lg text-center">
                    Action
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Loading.
                  </TableCell>
                </TableRow>
              ) : childData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No data available.
                  </TableCell>
                </TableRow>
              ) : (
                childData?.flatMap((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="text-center">
                      {`${child.first_name} ${child.last_name}`}
                    </TableCell>
                    {userRole !== "coparent" && (
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <ThreeDotsIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                              <EditChild
                                childId={child.id}
                                childFirstName={child.first_name}
                                childLastName={child.last_name}
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteChild(child.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Family;
