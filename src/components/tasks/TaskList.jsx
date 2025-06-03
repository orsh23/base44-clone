// components/tasks/TaskList.jsx
import React from 'react';
import { Button } from '../ui/button';
import { Eye, Pencil, Trash } from 'lucide-react';

export default function TaskList({
  tasks,
  selectedIds,
  onSelect,
  onStatusChange,
  onEdit,
  onView,
  onDelete,
  onFileUpload,
  uploadingId
}) {
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelect(tasks.map((t) => t.id));
    } else {
      onSelect([]);
    }
  };

  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-2"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === tasks.length} /></th>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Priority</th>
            <th className="text-left p-2">Attachment</th>
            <th className="text-right p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(task.id)}
                  onChange={() => onSelect(task.id)}
                />
              </td>
              <td className="p-2">{task.title}</td>
              <td className="p-2 capitalize">{task.status}</td>
              <td className="p-2 capitalize">{task.priority}</td>
              <td className="p-2">
                <input
                  type="file"
                  onChange={(e) => e.target.files[0] && onFileUpload(task.id, e.target.files[0])}
                  disabled={uploadingId === task.id}
                />
              </td>
              <td className="p-2 text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" onClick={() => onView(task)}><Eye size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => onEdit(task)}><Pencil size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(task)}><Trash size={14} /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
