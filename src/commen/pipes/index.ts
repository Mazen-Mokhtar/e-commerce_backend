import { PipeTransform, BadRequestException } from '@nestjs/common';
import { QueryFilterDTO } from '../dto';

export class QueryValidationPipe implements PipeTransform {
  transform(value: QueryFilterDTO) {
    // الـ regex للـ select: يسمح بالكلمات اللي تبدأ بحرف أو _ وتحتوي على حروف/أرقام/_
    const fieldPattern = '[a-zA-Z_][a-zA-Z0-9_]*';
    const selectRegex = new RegExp(`^(${fieldPattern})(\\s${fieldPattern})*$`);

    // تحقق من الـ select إذا كانت موجودة
    if (value.select && !selectRegex.test(value.select)) {
      throw new BadRequestException('Invalid select format. Use "name email" or "_id createdAt".');
    }

    // الـ regex للـ sort: يسمح بـ - اختياري في البداية، ثم حقل يبدأ بحرف أو _
    const sortRegex = new RegExp(`^(-?${fieldPattern})(\\s-?${fieldPattern})*$`);

    // تحقق من الـ sort إذا كانت موجودة
    if (value.sort && !sortRegex.test(value.sort)) {
      throw new BadRequestException('Invalid sort format. Use "name", "-createdAt", or "name -originalPrice".');
    }

    return value; // لو كل شيء تمام، نرجع القيمة
  }
}