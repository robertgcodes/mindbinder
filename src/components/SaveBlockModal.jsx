import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import StandardModal, { FormGroup, Label, Input, Textarea } from './StandardModal';

const SaveBlockModal = ({ isOpen, onClose, onSave, block }) => {
  const [name, setName] = useState(block?.title || '');
  const [description, setDescription] = useState(block?.description || '');
  const [tags, setTags] = useState('');

  const handleSave = () => {
    onSave({
      name: name.trim() || `${block?.type} Block`,
      description: description.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
    onClose();
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Block to Library"
      icon={Bookmark}
      onSave={handleSave}
      saveText="Save to Library"
      maxWidth="500px"
    >
      <FormGroup>
        <Label>Block Name</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`${block?.type?.replace('-', ' ')} Block`}
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what makes this block special..."
          rows={3}
        />
      </FormGroup>

      <FormGroup>
        <Label>Tags (comma separated)</Label>
        <Input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="productivity, wellness, daily"
        />
      </FormGroup>
    </StandardModal>
  );
};

export default SaveBlockModal;