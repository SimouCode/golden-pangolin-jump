"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { useGoals, Goal } from '@/contexts/GoalContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import EditGoalDialog from '@/components/EditGoalDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const GoalsPage = () => {
  const { t } = useTranslation();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();

  const [goalName, setGoalName] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmountInput, setCurrentAmountInput] = useState<string>('0'); // Renamed to avoid conflict
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState<string>('');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [updateSavedAmountInputs, setUpdateSavedAmountInputs] = useState<Record<string, string>>({}); // Renamed

  const handleAddGoal = async () => {
    const parsedTargetAmount = parseFloat(targetAmount);
    const parsedCurrentAmount = parseFloat(currentAmountInput); // Use renamed state

    if (!goalName || isNaN(parsedTargetAmount) || parsedTargetAmount <= 0) {
      showError(t('goal_save_error_fields'));
      return;
    }

    const newGoal = await addGoal({
      name: goalName,
      target_amount: parsedTargetAmount,
      saved_amount: parsedCurrentAmount,
      deadline: dueDate,
      description,
    });

    if (newGoal) {
      // Reset form
      setGoalName('');
      setTargetAmount('');
      setCurrentAmountInput('0');
      setDueDate(undefined);
      setDescription('');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const success = await deleteGoal(id);
    if (success) {
      showSuccess(t('goal_deleted_success'));
    }
  };

  const handleEditClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSavedAmountInputChange = (goalId: string, value: string) => {
    setUpdateSavedAmountInputs((prev) => ({ ...prev, [goalId]: value }));
  };

  const handleUpdateSavedAmount = async (goal: Goal) => {
    const inputAmount = parseFloat(updateSavedAmountInputs[goal.id] || '0');
    if (isNaN(inputAmount) || inputAmount < 0) {
      showError(t('invalid_amount'));
      return;
    }

    const updated = await updateGoal({
      ...goal,
      saved_amount: inputAmount,
    });

    if (updated) {
      showSuccess(t('goal_current_amount_updated_success'));
      setUpdateSavedAmountInputs((prev) => ({ ...prev, [goal.id]: '' })); // Clear input after update
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('goals')}</h2>
        <p className="text-muted-foreground">{t('goals_page_description')}</p>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>{t('add_new_goal')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">{t('goal_name')}</Label>
                <Input
                  id="goalName"
                  placeholder={t('goal_name_placeholder')}
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">{t('target_amount')}</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder={formatCurrency(0, t('currency_locale'))}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAmount">{t('current_amount')}</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  placeholder={formatCurrency(0, t('currency_locale'))}
                  value={currentAmountInput}
                  onChange={(e) => setCurrentAmountInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">{t('due_date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>{t('pick_a_date')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('description_optional')}</Label>
                <Textarea
                  id="description"
                  placeholder={t('goal_description_placeholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button type="submit" onClick={handleAddGoal} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('add_goal')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-xl font-bold tracking-tight mt-8">{t('your_goals')}</h3>
        {goals.length === 0 ? (
          <div className="border rounded-lg p-4 text-center text-muted-foreground">
            {t('no_goals_yet')}
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => {
              const progress = (goal.saved_amount / goal.target_amount) * 100;
              return (
                <Card key={goal.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>{goal.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(goal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('confirm_delete')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('goal_delete_confirm')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)}>
                              {t('delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t('target')}: {formatCurrency(goal.target_amount, t('currency_locale'))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('current')}: {formatCurrency(goal.saved_amount, t('currency_locale'))}
                    </p>
                    {goal.deadline && (
                      <p className="text-sm text-muted-foreground">
                        {t('due_date')}: {format(goal.deadline, 'PPP')}
                      </p>
                    )}
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">
                        {t('description')}: {goal.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <Progress value={progress} className="w-full" />
                      <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-end space-x-2 mt-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`current-amount-${goal.id}`}>{t('update_current_amount')}</Label>
                        <Input
                          id={`current-amount-${goal.id}`}
                          type="number"
                          placeholder={formatCurrency(0, t('currency_locale'))}
                          value={updateSavedAmountInputs[goal.id] || ''}
                          onChange={(e) => handleUpdateSavedAmountInputChange(goal.id, e.target.value)}
                        />
                      </div>
                      <Button onClick={() => handleUpdateSavedAmount(goal)}>{t('update')}</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      {selectedGoal && (
        <EditGoalDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          goal={selectedGoal}
        />
      )}
    </Layout>
  );
};

export default GoalsPage;