"use client";
import React, { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import axios from "axios";
import { User } from "@/types/user";


const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const { toast } = useToast();
  const API_BASE = "https://backendskinmuse.vercel.app/api/auth";

  const fetchData = async () => {
    try {
      const token =
        localStorage.getItem("skinmuse_superadmin_token") ||
        localStorage.getItem("skinmuse_admin_token") ||
        "";

      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      // ✅ Get current user (logged-in user)
      const me = await axios.get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentUser(me.data);

      // ✅ Get all users
      const res = await axios.get(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let userList: User[] = Array.isArray(res.data)
        ? res.data
        : res.data?.users || [];

      // 🔹 In fetchData()
      if (me.data.role === "superAdmin") {
        // Superadmin sees everyone except itself
        userList = userList.filter((u) => u._id !== me.data._id);
      } else if (me.data.role === "admin") {
        // Admin sees only customers + itself
        userList = userList.filter(
          (u) => u.role === "customer" || u._id === me.data._id
        );
      }

      setUsers(userList);
      setFilteredUsers(userList);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    setFilteredUsers(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  // ❌ Delete user (only superadmin)
  const handleDelete = async (id: string) => {
    if (currentUser?.role !== "superAdmin") {
      toast({
        title: "Unauthorized",
        description: "Only superadmin can delete users",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(id);
      const res = await axios.delete(`${API_BASE}/user/${id}`, {
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem("skinmuse_superadmin_token") || ""
          }`,
        },
      });
      if (res.data.success) {
        setUsers(users.filter((u) => u._id !== id));
        setFilteredUsers(filteredUsers.filter((u) => u._id !== id));
        toast({
          title: "User Deleted!",
          description: "The user has been successfully deleted.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }finally{
      setLoading(null)
    }
  };

  // ✏️ Save edit
  const handleSaveEdit = async () => {
    if (!editingUser) return;

    if (editingUser.role === "admin" && currentUser?.role !== "superAdmin") {
      toast({
        title: "Unauthorized",
        description: "Only superadmin can assign admin role",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axios.put(
        `${API_BASE}/editUser/${editingUser._id}`,
        editingUser,
        {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("skinmuse_superadmin_token") || ""
            }`,
          },
        }
      );
      if (res.data.success) {
        setUsers(
          users.map((u) => (u._id === editingUser._id ? res.data.user : u))
        );
        setFilteredUsers(
          filteredUsers.map((u) =>
            u._id === editingUser._id ? res.data.user : u
          )
        );
        toast({
          title: "User Updated!",
          description: "The user has been updated.",
        });
        setIsEditDialogOpen(false);
        setEditingUser(null);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Manage Users
        </h1>
        <p className="text-sm text-gray-500">
          Logged in as: <b>{currentUser?.role}</b>
        </p>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id || user.name}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="flex gap-2">
                        {/* Edit button */}
                        {(currentUser?.role === "superAdmin" ||
                          (currentUser?.role === "admin" &&
                            (user.role === "customer" ||
                              user._id === currentUser._id))) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-foreground text-background hover:bg-foreground"
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </Button>
                        )}

                        {/* Delete button */}
                        {currentUser?.role === "superAdmin" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-background text-foreground hover:text-background border border-foreground hover:bg-foreground"
                            onClick={() => handleDelete(user._id)}
                          >
                            <Trash2 className="h-4 w-4" /> {loading === user._id ? "Deleting..." : "Delete"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {filteredUsers.map((user) => (
                <Card key={user._id || user.name} className="p-4 shadow-sm">
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Name:</span> {user.name}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {user.email}
                    </p>
                    <p>
                      <span className="font-semibold">Role:</span> {user.role}
                    </p>
                    <div className="flex gap-2 pt-2">
                      {(currentUser?.role === "superAdmin" ||
                        (currentUser?.role === "admin" &&
                          (user.role === "customer" ||
                            user._id === currentUser._id))) && (
                        <Button
                          size="sm"
                          variant="outline"
                            className="bg-foreround text-foreground hover:bg-foreground"
                          
                          onClick={() => {
                            setEditingUser(user);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </Button>
                      )}
                      {currentUser?.role === "superAdmin" && (
                        <Button
                          size="sm"
                          variant="destructive"
                            className="bg-foreround text-foreground hover:bg-foreground"
                          
                          onClick={() => handleDelete(user._id)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <Input
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                placeholder="Full Name"
              />
              <Input
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                placeholder="Email"
              />

              <select
                className="w-full border rounded-md p-2"
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value as User["role"],
                  })
                }
              >
                <option value="customer">Customer</option>
                {/* ✅ Only superadmin can assign admin */}
                {currentUser?.role === "superAdmin" && (
                  <option value="admin">Admin</option>
                )}
              </select>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="bg-background border border-foreground text-foreground hover:bg-foreground"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button className="bg-foreground text-background hover:bg-foreground" onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
