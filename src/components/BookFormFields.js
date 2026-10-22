import { View } from 'react-native';
import { AppInput, Field, Select } from './ui';
import { GENRES, STATUSES } from '../constants';

export function BookFormFields({ values, errors, onChange }) {
  return (
    <View>
      <Field label="Title" error={errors.title}>
        <AppInput
          testID="input-title"
          value={values.title}
          onChangeText={(text) => onChange('title', text)}
          placeholder="Book title"
        />
      </Field>

      <Field label="Author" error={errors.author}>
        <AppInput
          testID="input-author"
          value={values.author}
          onChangeText={(text) => onChange('author', text)}
          placeholder="Author name"
        />
      </Field>

      <Select
        label="Genre"
        value={values.genre}
        options={GENRES}
        placeholder="Choose genre"
        error={errors.genre}
        onChange={(value) => onChange('genre', value)}
        testID="select-genre"
        optionTestIDPrefix="option-genre"
      />

      <Select
        label="Status"
        value={values.status}
        options={STATUSES}
        placeholder="Choose status"
        error={errors.status}
        onChange={(value) => onChange('status', value)}
        testID="select-status"
        optionTestIDPrefix="option-status"
      />

      <Field label="Rating (optional, 0-5)" error={errors.rating}>
        <AppInput
          testID="input-rating"
          value={values.rating}
          onChangeText={(text) => onChange('rating', text)}
          placeholder="0 - 5"
          keyboardType="number-pad"
        />
      </Field>

      <Field label="Notes (optional)" error={errors.notes}>
        <AppInput
          testID="input-notes"
          value={values.notes}
          onChangeText={(text) => onChange('notes', text)}
          placeholder="Short note about this book"
          multiline
        />
      </Field>
    </View>
  );
}
