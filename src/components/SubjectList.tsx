import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Subject } from '../types';
import { Edit2, Save, X, Plus, Clock, MapPin, User } from 'lucide-react';

const SubjectList: React.FC = () => {
  const { state, updateSubjects } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [editedSubjects, setEditedSubjects] = useState<Subject[]>(state.subjects);
  const [newSubject, setNewSubject] = useState<Subject | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const handleEditToggle = () => {
    if (editMode) {
      // Save changes
      updateSubjects(editedSubjects);
    }
    setEditMode(!editMode);
    setNewSubject(null);
  };

  const handleCancelEdit = () => {
    setEditedSubjects(state.subjects);
    setEditMode(false);
    setNewSubject(null);
  };

  const handleSubjectChange = (index: number, field: keyof Subject, value: string | boolean) => {
    const updatedSubjects = [...editedSubjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      [field]: value
    };
    setEditedSubjects(updatedSubjects);
  };

  const handleAddNewSubject = () => {
    const newId = `subject-${Date.now()}`;
    setNewSubject({
      id: newId,
      name: '',
      faculty: '',
      roomNo: '',
      startTime: '08:00',
      endTime: '09:00',
      day: 'Monday',
      isLab: false
    });
  };

  const handleSaveNewSubject = () => {
    if (newSubject && newSubject.name.trim()) {
      setEditedSubjects([...editedSubjects, newSubject]);
      setNewSubject(null);
    }
  };

  const handleCancelNewSubject = () => {
    setNewSubject(null);
  };

  const handleDeleteSubject = (index: number) => {
    const updatedSubjects = [...editedSubjects];
    updatedSubjects.splice(index, 1);
    setEditedSubjects(updatedSubjects);
  };

  // Group subjects by day
  const subjectsByDay: Record<string, Subject[]> = {};
  
  days.forEach(day => {
    subjectsByDay[day] = editedSubjects.filter(
      subject => subject.day === day
    ).sort((a, b) => {
      // Sort by start time
      return a.startTime.localeCompare(b.startTime);
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Subject List</h2>
        <div className="flex space-x-2">
          {editMode ? (
            <>
              <button
                onClick={handleEditToggle}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleEditToggle}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {days.map(day => (
        <div key={day} className="space-y-3">
          <h3 className="text-md font-medium text-gray-700 border-b pb-2">{day}</h3>
          
          {subjectsByDay[day].length === 0 ? (
            <p className="text-sm text-gray-500 italic">No subjects scheduled</p>
          ) : (
            <div className="space-y-3">
              {subjectsByDay[day].map((subject, index) => {
                const subjectIndex = editedSubjects.findIndex(s => s.id === subject.id);
                
                return (
                  <div key={subject.id} className="bg-gray-50 rounded-lg p-4">
                    {editMode ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => handleSubjectChange(subjectIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Subject Name"
                          />
                          <button
                            onClick={() => handleDeleteSubject(subjectIndex)}
                            className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-md"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                            <input
                              type="time"
                              value={subject.startTime}
                              onChange={(e) => handleSubjectChange(subjectIndex, 'startTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">End Time</label>
                            <input
                              type="time"
                              value={subject.endTime}
                              onChange={(e) => handleSubjectChange(subjectIndex, 'endTime', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Room Number</label>
                          <input
                            type="text"
                            value={subject.roomNo}
                            onChange={(e) => handleSubjectChange(subjectIndex, 'roomNo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Room Number"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Faculty</label>
                          <input
                            type="text"
                            value={subject.faculty}
                            onChange={(e) => handleSubjectChange(subjectIndex, 'faculty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Faculty Name"
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`is-lab-${subject.id}`}
                            checked={subject.isLab}
                            onChange={(e) => handleSubjectChange(subjectIndex, 'isLab', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`is-lab-${subject.id}`} className="ml-2 block text-sm text-gray-600">
                            This is a lab session
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium text-gray-900">{subject.name}</h4>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600 flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{subject.startTime} - {subject.endTime}</span>
                            {subject.isLab && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Lab
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{subject.roomNo}</span>
                          </p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <User className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{subject.faculty}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {editMode && !newSubject && (
        <button
          onClick={handleAddNewSubject}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>Add New Subject</span>
        </button>
      )}

      {newSubject && (
        <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h3 className="text-md font-medium text-blue-800 mb-3">Add New Subject</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Subject Name</label>
              <input
                type="text"
                value={newSubject.name}
                onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Subject Name"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Day</label>
              <select
                value={newSubject.day}
                onChange={(e) => setNewSubject({...newSubject, day: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={newSubject.startTime}
                  onChange={(e) => setNewSubject({...newSubject, startTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  value={newSubject.endTime}
                  onChange={(e) => setNewSubject({...newSubject, endTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Room Number</label>
              <input
                type="text"
                value={newSubject.roomNo}
                onChange={(e) => setNewSubject({...newSubject, roomNo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Room Number"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">Faculty</label>
              <input
                type="text"
                value={newSubject.faculty}
                onChange={(e) => setNewSubject({...newSubject, faculty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Faculty Name"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is-lab-new"
                checked={newSubject.isLab}
                onChange={(e) => setNewSubject({...newSubject, isLab: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is-lab-new" className="ml-2 block text-sm text-gray-600">
                This is a lab session
              </label>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleSaveNewSubject}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelNewSubject}
                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectList;