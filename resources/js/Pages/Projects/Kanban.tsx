import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  Users, 
  Clock,
  Target
} from 'lucide-react';
import { Project, ProjectMilestone } from '@/types';
import useRoute from '@/Hooks/useRoute';

interface KanbanProps {
  auth: {
    user: any;
  };
  project: Project;
  milestones: ProjectMilestone[];
}

interface KanbanColumn {
  id: string;
  title: string;
  milestones: ProjectMilestone[];
}

export default function ProjectKanban({ auth, project, milestones }: KanbanProps) {
  const route = useRoute();

  // Initialize Kanban columns
  const [columns, setColumns] = useState<KanbanColumn[]>([
    {
      id: 'pending',
      title: 'Pending',
      milestones: milestones.filter(m => m.status === 'pending')
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      milestones: milestones.filter(m => m.status === 'in-progress')
    },
    {
      id: 'completed',
      title: 'Completed',
      milestones: milestones.filter(m => m.status === 'completed')
    },
    {
      id: 'overdue',
      title: 'Overdue',
      milestones: milestones.filter(m => m.status === 'overdue')
    }
  ]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) {
      return;
    }

    const milestone = sourceColumn.milestones.find(m => m.id.toString() === draggableId);
    if (!milestone) {
      return;
    }

    // Update milestone status based on destination column
    const newStatus = destination.droppableId as ProjectMilestone['status'];
    const updatedMilestone = { ...milestone, status: newStatus };

    // Remove milestone from source column
    const newSourceMilestones = sourceColumn.milestones.filter(m => m.id.toString() !== draggableId);
    
    // Add milestone to destination column
    const newDestMilestones = [...destColumn.milestones];
    newDestMilestones.splice(destination.index, 0, updatedMilestone);

    // Update columns state
    setColumns(prevColumns => 
      prevColumns.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, milestones: newSourceMilestones };
        }
        if (col.id === destination.droppableId) {
          return { ...col, milestones: newDestMilestones };
        }
        return col;
      })
    );

    // TODO: Make API call to update milestone status
    // router.patch(route('projects.milestones.update', [project.id, milestone.id]), {
    //   status: newStatus
    // });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | null) => {
    return date ? new Date(date).toLocaleDateString() : 'No due date';
  };

  return (
    <AppLayout
      title={`${project.name} - Kanban Board`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {project.name} - Kanban Board
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Drag and drop milestones to update their status
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
            <Button variant="outline">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={`${project.name} - Kanban Board`} />

      <div className="py-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {column.title}
                  </h3>
                  <Badge variant="secondary">
                    {column.milestones.length}
                  </Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 p-2 rounded-lg min-h-[200px] ${
                        snapshot.isDraggingOver 
                          ? 'bg-blue-50 border-2 border-blue-200 border-dashed' 
                          : 'bg-gray-50'
                      }`}
                    >
                      {column.milestones.map((milestone, index) => (
                        <Draggable
                          key={milestone.id}
                          draggableId={milestone.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-move transition-shadow ${
                                snapshot.isDragging 
                                  ? 'shadow-lg rotate-2' 
                                  : 'hover:shadow-md'
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-medium text-sm line-clamp-2">
                                      {milestone.name}
                                    </h4>
                                    {milestone.description && (
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {milestone.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap gap-1">
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getPriorityBadgeColor(milestone.priority)}`}
                                    >
                                      {milestone.priority}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span>Progress</span>
                                      <span>{milestone.progress}%</span>
                                    </div>
                                    <Progress value={milestone.progress} className="h-1" />
                                  </div>

                                  <div className="space-y-1 text-xs text-gray-600">
                                    {milestone.due_date && (
                                      <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        <span>{formatDate(milestone.due_date)}</span>
                                      </div>
                                    )}
                                    
                                    {milestone.assignee && (
                                      <div className="flex items-center">
                                        <Users className="h-3 w-3 mr-1" />
                                        <span>{milestone.assignee.name}</span>
                                      </div>
                                    )}

                                    {milestone.is_overdue && (
                                      <div className="flex items-center text-red-600">
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span>Overdue</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {column.milestones.length === 0 && (
                        <div className="flex items-center justify-center h-32 text-gray-400">
                          <div className="text-center">
                            <Target className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">No milestones</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </AppLayout>
  );
}
