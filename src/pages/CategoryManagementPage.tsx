"use client";

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories, Category } from '@/hooks/use-categories';
import { showError, showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface EditCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({ isOpen, onClose, category }) => {
  const { t } = useTranslation();
  const { updateCategory } = useCategories();
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
    }
  }, [category]);

  const handleUpdateCategory = async () => {
    if (!category || !name || !type) {
      showError(t('category_save_error_fields'));
      return;
    }
    const updated = await updateCategory(category.id, name, type);
    if (updated) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('edit_category')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">{t('category_name')}</Label>
            <Input
              id="categoryName"
              placeholder={t('category_name_placeholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryType">{t('type')}</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">{t('income')}</SelectItem>
                <SelectItem value="expense">{t('expense')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={handleUpdateCategory}>{t('update')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const CategoryManagementPage = () => {
  const { t } = useTranslation();
  const { categories, addCategory, deleteCategory, isLoading } = useCategories();

  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleAddCategory = async () => {
    if (!newCategoryName || !newCategoryType) {
      showError(t('category_save_error_fields'));
      return;
    }
    const added = await addCategory(newCategoryName, newCategoryType);
    if (added) {
      setNewCategoryName('');
      setNewCategoryType('expense');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const success = await deleteCategory(id);
    if (success) {
      showSuccess(t('category_deleted_success'));
    }
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{t('category_management')}</h2>
        <p className="text-muted-foreground">{t('category_management_description')}</p>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>{t('add_new_category')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 items-end">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="newCategoryName">{t('category_name')}</Label>
                <Input
                  id="newCategoryName"
                  placeholder={t('category_name_placeholder')}
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="newCategoryType">{t('type')}</Label>
                <Select value={newCategoryType} onValueChange={(value: 'income' | 'expense') => setNewCategoryType(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t('income')}</SelectItem>
                    <SelectItem value="expense">{t('expense')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddCategory} className="w-full md:col-span-1">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('add_category')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-xl font-bold tracking-tight mt-8">{t('your_categories')}</h3>
        {isLoading ? (
          <div className="border rounded-lg p-4 text-center text-muted-foreground">
            {t('loading_categories')}
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="border rounded-lg p-4 text-center text-muted-foreground">
            {t('no_categories_yet')}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('category_name')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead className="text-center">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                        category.type === 'income' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      )}>
                        {t(category.type)}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(category)}>
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
                              {t('category_delete_confirm')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
                              {t('delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      {selectedCategory && (
        <EditCategoryDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          category={selectedCategory}
        />
      )}
    </Layout>
  );
};

export default CategoryManagementPage;