import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit3, Plus } from "lucide-react";
import { toast } from "sonner"; // if you use toast lib, else replace with alert

const API_URL = import.meta.env.VITE_API_URL || "https://skinmusebackend-delta.vercel.app";

const AdminAnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    message: "",
    backgroundColor: "#00000ff",
    textColor: "#ffffffff",
    isActive: true,
    order: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preLoader, setPreLoader] = useState(true);

  // ✅ Fetch all announcements
  const fetchAnnouncements = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/announcements`);
      setAnnouncements(data);
    } catch (err) {
      toast.error("Failed to fetch announcements");
    }finally {
      setPreLoader(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // ✅ Create or Update announcement
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${API_URL}/api/announcements/${editingId}`, formData);
        toast.success("Announcement updated successfully");
      } else {
        await axios.post(`${API_URL}/api/announcements`, formData);
        toast.success("Announcement created successfully");
      }
      setFormData({
        message: "",
        backgroundColor: "#f59e0b",
        textColor: "#ffffff",
        isActive: true,
        order: 0,
      });
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      toast.error("Failed to save announcement");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit existing announcement
  const handleEdit = (announcement) => {
    setFormData({
      message: announcement.message,
      backgroundColor: announcement.backgroundColor,
      textColor: announcement.textColor,
      isActive: announcement.isActive,
      order: announcement.order,
    });
    setEditingId(announcement._id);
  };

  // ✅ Delete announcement
  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`${API_URL}/api/announcements/${id}`);
      toast.success("Deleted successfully");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to delete");
    }
  };
  
  if (preLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading Announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-foreground">📢 Manage Announcements</h1>

      {/* === Announcement Form === */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-6 rounded-2xl shadow-lg border"
      >
        <div className="col-span-2">
          <Label>Message</Label>
          <Input
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter announcement message"
            required
          />
        </div>

        

        <div>
          <Label>Order (for sorting)</Label>
          <Input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
          />
          <Label>Active</Label>
        </div>

        <div className="col-span-2 flex justify-end gap-3">
          <Button
            type="submit"
            className="flex items-center gap-2 bg-secondary text-background hover:bg-secondary/90"
            disabled={loading}
          >
            {editingId ? (
              <>
                <Edit3 size={16} /> Update
              </>
            ) : (
              <>
                <Plus size={16} /> Add
              </>
            )}
          </Button>
        </div>
      </form>

      {/* === Announcements List === */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">All Announcements</h2>
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <p className="text-muted-foreground">No announcements yet.</p>
          ) : (
            announcements.map((a) => (
              <div
                key={a._id}
                className="flex justify-between items-center border rounded-xl p-4 shadow-sm bg-background"
              >
                <div>
                  <p className="font-medium" style={{ color: a.textColor, background: a.backgroundColor, padding: "5px 10px", borderRadius: "6px" }}>
                    {a.message}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Order: {a.order} | {a.isActive ? "🟢 Active" : "🔴 Inactive"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="bg-foreground text-background" size="sm" onClick={() => handleEdit(a)}>
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(a._id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncementManager;
