import { create, all } from "mathjs";
import { toast } from "sonner";

const math = create(all);

interface BielaManivelaParams {
  Lm: string;
  Lb: string;
  e: string;
  theta_m_deg: string;
  theta_b_deg: string;
  s: string;
  vel_m: string;
  vel_b: string;
  vel_s: string;
  acc_m: string;
  acc_b: string;
  acc_s: string;
}

export class BielaManivela {
  public Lm: number = 0;
  public Lb: number = 0;
  public e: number = 0;
  public theta_m_rad: number = 0;
  public theta_b_rad: number = 0;
  public s: number = 0;
  public vel_m: number = 0;
  public vel_b: number = 0;
  public vel_s: number = 0;
  public acc_m: number = 0;
  public acc_b: number = 0;
  public acc_s: number = 0;

  constructor() {}

  degToRadians(value: string) {
    return (parseFloat(value) * math.pi) / 180;
  }

  radiansToDegrees(value: number) {
    return (value * 180) / math.pi;
  }

  stringToNumber(value: string) {
    return parseFloat(value);
  }

  setParams(params: BielaManivelaParams) {
    this.Lm = this.stringToNumber(params.Lm);
    this.Lb = this.stringToNumber(params.Lb);
    this.e = this.stringToNumber(params.e);
    this.theta_m_rad = this.degToRadians(params.theta_m_deg);
    this.theta_b_rad = this.degToRadians(params.theta_b_deg);
    this.s = this.stringToNumber(params.s);
    this.vel_m = this.stringToNumber(params.vel_m);
    this.vel_b = this.stringToNumber(params.vel_b);
    this.vel_s = this.stringToNumber(params.vel_s);
    this.acc_m = this.stringToNumber(params.acc_m);
    this.acc_b = this.stringToNumber(params.acc_b);
    this.acc_s = this.stringToNumber(params.acc_s);
  }

  isNumber(value: string) {
    return !isNaN(parseFloat(value));
  }

  validateParam(value: string, name: string) {
    if (value === "") {
      throw new Error(name + " no puede estar vacío");
    }
    if (!this.isNumber(value)) {
      throw new Error(name + " debe ser un número");
    }
    if (parseFloat(value) <= 0) {
      throw new Error(name + " debe ser mayor que cero");
    }
    return parseFloat(value);
  }

  validateParams(params: BielaManivelaParams) {
    console.log(params);
    try {
      this.Lm = this.validateParam(params.Lm, "Longitud de manivela (Lm)");
      this.Lb = this.validateParam(params.Lb, "Longitud de biela (Lb)");
      this.e = this.validateParam(params.e, "Excentricidad (e)");

      const inputParams = [
        params.theta_m_deg !== "",
        params.theta_b_deg !== "",
        params.s !== "",
      ].filter(Boolean).length;
      
      if (inputParams === 0) {
        throw new Error(
          "Se debe proporcionar al menos uno de los siguientes: ángulo de manivela, ángulo de biela o posición"
        );
      }
      if (inputParams > 1) {
        throw new Error(
          "Solo se debe proporcionar uno de los siguientes: ángulo de manivela, ángulo de biela o posición"
        );
      }

      if (
        this.theta_m_rad !== undefined &&
        (this.theta_m_rad < -360 || this.theta_m_rad > 360)
      ) {
        throw new Error(
          "El ángulo de la manivela debe estar entre -360° y 360°"
        );
      }

      if (
        this.theta_b_rad !== undefined &&
        (this.theta_b_rad < -360 || this.theta_b_rad > 360)
      ) {
        throw new Error("El ángulo de la biela debe estar entre -360° y 360°");
      }

      // Validar que la relación Lb/Lm sea razonable (regla empírica)
      if (this.Lb / this.Lm < 2) {
        throw new TypeError(
          "La relación longitud biela/manivela (Lb/Lm) es menor a 2, lo que puede causar problemas mecánicos"
        );
      }
      return true;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (error instanceof TypeError) {
        toast.warning(error.message);
      }
      return false;
    }
  }

  calculatePosition() {
    this.s =
      this.Lm * math.cos(this.theta_m_rad) +
      this.Lb * math.sin(this.theta_b_rad);
    return this.s;
  }

  equationOfMotion() {
    console.log(this.theta_m_rad);
    if (this.theta_m_rad === 0) {
      const dividend = math.add(
        math.multiply(this.Lm, math.sin(this.theta_m_rad)),
        this.e
      );
      const divisor = this.Lb;
      const asin_argument = dividend / divisor;

      this.theta_b_rad = math.asin(asin_argument) as number;
      this.calculatePosition();

      return {
        theta_m_deg: this.radiansToDegrees(this.theta_m_rad),
        theta_b_deg: this.radiansToDegrees(this.theta_b_rad),
        s: this.s,
      };
    }

    if (this.theta_b_rad) {
      const dividend = math.subtract(
        math.multiply(this.Lb, math.sin(this.theta_b_rad)),
        this.e
      );
      const divisor = this.Lm;

      this.theta_m_rad = math.asin(dividend / divisor) as number;
      this.calculatePosition();

      return {
        theta_m_deg: this.radiansToDegrees(this.theta_m_rad),
        theta_b_deg: this.radiansToDegrees(this.theta_b_rad),
        s: this.s,
      };
    }

    if (this.s) {
      const acos_dividend = math.add(
        math.add(math.pow(this.s, 2), math.pow(this.e, 2)),
        math.subtract(math.pow(this.Lb, 2), math.pow(this.Lm, 2))
      );
      const acos_divisor = math.multiply(2, this.Lb);
      const acos_argument = math.divide(acos_dividend, acos_divisor) as number;
      this.theta_b_rad = math.add(
        math.atan(math.divide(this.e, this.s)),
        math.acos(acos_argument)
      ) as number;

      const asin_dividend = math.subtract(
        math.multiply(this.Lb, math.sin(this.theta_b_rad)),
        this.e
      );
      const asin_divisor = this.Lm;

      this.theta_m_rad = math.asin(asin_dividend / asin_divisor) as number;

      console.log({
        asin_dividend: asin_dividend,
        asin_divisor: asin_divisor,
        theta_m_rad: this.theta_m_rad,
      });

      return {
        theta_m_deg: (this.theta_m_rad * 180) / math.pi,
        theta_b_deg: (this.theta_b_rad * 180) / math.pi,
        s: this.s,
      };
    }
  }

  calculateVelocity() {
    if (this.vel_m) {
      const A = [
        [
          this.Lm * math.sin(this.theta_m_rad),
          this.Lb * math.sin(this.theta_b_rad),
          1,
        ],
        [
          this.Lm * math.cos(this.theta_m_rad),
          -this.Lb * math.cos(this.theta_b_rad),
          0,
        ],
        [1, 0, 0],
      ];

      const b = [0, 0, this.vel_m];

      const x = math.lusolve(A, b) as number[][];

      const [theta_b_dot, s_dot] = [x[1][0], x[2][0]];
      this.vel_b = theta_b_dot;
      this.vel_s = s_dot;

      return {
        theta_m_dot: this.vel_m,
        theta_b_dot,
        s_dot,
      };
    } else if (this.vel_b) {
      return {
        theta_m_dot: this.vel_m,
        theta_b_dot: this.vel_b,
        s_dot: this.vel_s,
      };
    }
  }
}
